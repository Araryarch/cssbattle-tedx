// Barrel re-export for backward compatibility.
// All server actions are now organized in domain-specific files.
// NOTE: Do NOT add "use server" here — sub-modules already declare it.

export {
  getChallengeAction,
  getChallengesAction,
  createChallengeAction,
  updateChallengeAction,
  deleteChallengeAction,
} from "./challenge-actions";

export {
  saveSubmissionAction,
  getSubmissionsAction,
} from "./submission-actions";

export { uploadChallengeImageAction } from "./upload-actions";
