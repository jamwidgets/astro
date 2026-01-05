/**
 * @seriphxyz/astro
 *
 * Astro components and content loader for Seriph widgets.
 * Re-exports all types, API functions, and controllers from @seriphxyz/core.
 */
// Re-export everything from core
export { 
// Constants
DEFAULT_ENDPOINT, API_PATH, VISITOR_STORAGE_KEY, 
// Helpers
buildUrl, getSiteKey, getVisitorId, setVisitorId, submitForm, fetchComments, postComment, fetchReactions, addReaction, removeReaction, subscribe, joinWaitlist, getViewCounts, recordView, submitFeedback, fetchPoll, votePoll, fetchAnnouncements, dismissAnnouncement, fetchPosts, fetchPost, SubscribeController, WaitlistController, FormController, ReactionsController, CommentsController, ViewCountsController, FeedbackController, PollController, AnnouncementsController, } from "@seriphxyz/core";
// Re-export loader (Astro-specific)
export { seriphPostsLoader, } from "./loader.js";
