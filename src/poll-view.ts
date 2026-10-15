/**
 * The poll widget's markup and browser behavior, shared by Poll.astro and the
 * polls Embed.astro hydrates inside post content. Requests, result visibility
 * and error messages come from @jamwidgets/core's PollController.
 */
import { describePoll, PollController } from "@jamwidgets/core";

/** Inner markup of a poll container; the container carries the theme classes. */
export const POLL_MARKUP = `
  <div class="jamwidgets-poll-loading">
    <span class="jamwidgets-poll-spinner"></span>
  </div>
  <div class="jamwidgets-poll-content" style="display: none;">
    <h3 class="jamwidgets-poll-question"></h3>
    <div class="jamwidgets-poll-options"></div>
    <div class="jamwidgets-poll-footer">
      <span class="jamwidgets-poll-total"></span>
      <span class="jamwidgets-poll-status"></span>
    </div>
    <button type="button" class="jamwidgets-poll-submit" style="display: none;">Vote</button>
  </div>
  <div class="jamwidgets-poll-error" style="display: none;"></div>
`;

export interface MountPollOptions {
  siteKey: string;
  /** Base URL of the Jamwidgets instance, without the API path */
  endpoint: string;
  slug: string;
  /** Names the widget in the console warning when the poll is missing */
  widget?: string;
}

/**
 * Load the poll into a container holding POLL_MARKUP and wire up voting.
 * A missing or unpublished poll hides the container.
 */
export function mountPoll(container: HTMLElement, options: MountPollOptions): void {
  // Poll and Embed may both see a container; wire it up once.
  if (container.dataset.jamwidgetsMounted !== undefined) return;
  container.dataset.jamwidgetsMounted = "";
  const { slug } = options;
  const controller = new PollController(
    { siteKey: options.siteKey, endpoint: options.endpoint },
    slug,
    options.widget,
  );

  const element = <T extends HTMLElement>(selector: string) => container.querySelector(selector) as T;
  const loadingEl = element(".jamwidgets-poll-loading");
  const contentEl = element(".jamwidgets-poll-content");
  const errorEl = element(".jamwidgets-poll-error");
  const questionEl = element(".jamwidgets-poll-question");
  const optionsEl = element(".jamwidgets-poll-options");
  const totalEl = element(".jamwidgets-poll-total");
  const statusEl = element(".jamwidgets-poll-status");
  const submitBtn = element<HTMLButtonElement>(".jamwidgets-poll-submit");

  let selectedOptions = new Set<string>();

  function render() {
    const poll = controller.getState().poll;
    if (!poll) return;
    const view = describePoll(poll);

    loadingEl.style.display = "none";
    contentEl.style.display = "block";
    questionEl.textContent = poll.question;

    // Pre-select the visitor's votes if any
    if (poll.userVotes) selectedOptions = new Set(poll.userVotes);

    optionsEl.innerHTML = "";
    for (const option of poll.options) {
      const optionEl = document.createElement("div");
      optionEl.className = "jamwidgets-poll-option";

      const votes = poll.results[option.id] || 0;
      const percent = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
      const isSelected = selectedOptions.has(option.id);

      if (view.canVote) {
        const inputType = poll.settings.multiSelect ? "checkbox" : "radio";
        optionEl.innerHTML = `
          <label class="jamwidgets-poll-label ${isSelected ? "jamwidgets-selected" : ""}">
            <input type="${inputType}" ${isSelected ? "checked" : ""} />
            <span class="jamwidgets-poll-text"></span>
          </label>
        `;
        const input = optionEl.querySelector("input")!;
        input.name = `poll-${poll.id}`;
        input.value = option.id;
        input.addEventListener("change", () => {
          if (poll.settings.multiSelect) {
            if (input.checked) selectedOptions.add(option.id);
            else selectedOptions.delete(option.id);
          } else {
            selectedOptions = new Set([option.id]);
          }
          updateSubmitButton();
          optionsEl.querySelectorAll(".jamwidgets-poll-label").forEach((label) => {
            const labelInput = label.querySelector("input") as HTMLInputElement;
            label.classList.toggle("jamwidgets-selected", labelInput.checked);
          });
        });
      } else if (view.showResults) {
        optionEl.innerHTML = `
          <div class="jamwidgets-poll-result ${isSelected ? "jamwidgets-voted" : ""}">
            <div class="jamwidgets-poll-bar" style="width: ${percent}%"></div>
            <span class="jamwidgets-poll-text"></span>
            <span class="jamwidgets-poll-percent">${percent}%</span>
          </div>
        `;
      } else {
        // Voted or closed, but the poll's settings hide results
        optionEl.innerHTML = `
          <div class="jamwidgets-poll-result jamwidgets-no-results ${isSelected ? "jamwidgets-voted" : ""}">
            <span class="jamwidgets-poll-text"></span>
          </div>
        `;
      }
      optionEl.querySelector(".jamwidgets-poll-text")!.textContent = option.text;
      optionsEl.appendChild(optionEl);
    }

    totalEl.textContent = view.showResults
      ? `${poll.totalVotes} vote${poll.totalVotes !== 1 ? "s" : ""}`
      : "";
    statusEl.textContent = view.status;

    if (view.canVote) {
      submitBtn.style.display = "";
      updateSubmitButton();
    } else {
      submitBtn.style.display = "none";
    }
  }

  function updateSubmitButton() {
    submitBtn.disabled = selectedOptions.size === 0;
  }

  submitBtn.addEventListener("click", async () => {
    if (selectedOptions.size === 0) return;
    const chosen = Array.from(selectedOptions);

    submitBtn.disabled = true;
    submitBtn.textContent = "Voting...";
    try {
      const result = await controller.vote(chosen);
      container.dispatchEvent(
        new CustomEvent("jamwidgets:poll-voted", {
          detail: { pollSlug: slug, selectedOptions: chosen, results: result },
        }),
      );
      render();
    } catch (e) {
      console.error("Failed to vote:", e);
      submitBtn.disabled = false;
      submitBtn.textContent = "Vote";
      errorEl.style.display = "block";
      errorEl.textContent = e instanceof Error ? e.message : "Failed to vote";
      setTimeout(() => {
        errorEl.style.display = "none";
      }, 3000);
    }
  });

  controller
    .fetch()
    .then((poll) => {
      if (poll) {
        render();
      } else {
        // Missing or unpublished poll: show visitors nothing. The controller
        // has already warned in the console.
        container.style.display = "none";
      }
    })
    .catch((e) => {
      console.error("Failed to load poll:", e);
      loadingEl.style.display = "none";
      errorEl.style.display = "block";
      errorEl.textContent = "Failed to load poll";
    });
}
