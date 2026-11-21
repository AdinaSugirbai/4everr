useEffect(() => {
  const client = supabase();
  let done = false;
  const finish = () => {
    if (!done) {
      done = true;
      setReady(true);
    }
  };
  const timer = setTimeout(finish, 4000);

  const sync = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }
    const p = await loadProfile(session.user.id, session.user.email ?? "");
    setUser(p && !p.banned ? p : null);
  };

  client.auth
    .getSession()
    .then(({ data }) => sync(data.session))
    .catch(() => setUser(null))
    .finally(() => {
      clearTimeout(timer);
      finish();
    });

  const { data: sub } = client.auth.onAuthStateChange((_e, session) => sync(session));
  return () => {
    clearTimeout(timer);
    sub.subscription.unsubscribe();
  };
}, []);
