export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/:team/roster","/:team/rsvp", "/matchSchedule","/organiserlogin"],
};
