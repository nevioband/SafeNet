import { createClient as s } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm";
export const supabase = s(
  "https://dygrabyaiyessqmjdprc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss",
  {
    auth: {
      storage: window.localStorage,
      persistSession: !0,
      autoRefreshToken: !0,
    },
  },
);
!(function () {
  const s = new BroadcastChannel("safenet_auth_sync");
  (supabase.auth.getSession().then(({ data: e }) => {
    e.session || s.postMessage({ type: "REQUEST_SESSION" });
  }),
    s.addEventListener("message", async (e) => {
      if ("REQUEST_SESSION" === e.data.type) {
        const { data: e } = await supabase.auth.getSession();
        e.session &&
          s.postMessage({
            type: "SESSION_DATA",
            access_token: e.session.access_token,
            refresh_token: e.session.refresh_token,
          });
      } else if ("SESSION_DATA" === e.data.type) {
        const { data: s } = await supabase.auth.getSession();
        s.session ||
          (await supabase.auth.setSession({
            access_token: e.data.access_token,
            refresh_token: e.data.refresh_token,
          }));
      }
    }));
})();
