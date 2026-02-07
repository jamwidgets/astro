/**
 * @jamwidgets/astro
 *
 * Astro components and content loader for Jamwidgets.
 * Re-exports all types, API functions, and controllers from @jamwidgets/core.
 */
// Re-export everything from core
export { 
// Constants
DEFAULT_ENDPOINT, API_PATH, VISITOR_STORAGE_KEY, 
// Helpers
buildUrl, getSiteKey, getVisitorId, setVisitorId, submitForm, fetchComments, postComment, fetchReactions, addReaction, removeReaction, subscribe, joinWaitlist, getViewCounts, recordView, submitFeedback, fetchPoll, votePoll, fetchAnnouncements, dismissAnnouncement, fetchPosts, fetchPost, SubscribeController, WaitlistController, FormController, ReactionsController, CommentsController, ViewCountsController, FeedbackController, PollController, AnnouncementsController, } from "@jamwidgets/core";
// Re-export loader (Astro-specific)
export { jamwidgetsPostsLoader, seriphPostsLoader, // deprecated alias
 } from "./loader.js";
