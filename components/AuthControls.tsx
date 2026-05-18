"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

// Minimal MD5 implementation (adapted for small client-side use)
function md5(str: string) {
  function L(k: number, d: number) {
    return (k << d) | (k >>> (32 - d));
  }
  function K(G: number, k: number) {
    let I, d, F, H, x;
    F = (G & 2147483648) | (k & 2147483648);
    H = (G & 1073741824) | (k & 1073741824);
    I = (G & 1073741823) + (k & 1073741823);
    return I ^ F ^ H;
  }
  function r(d: string) {
    let n = "";
    for (let i = 0; i < d.length; i++) {
      let c = d.charCodeAt(i);
      if (c < 128) n += String.fromCharCode(c);
      else if (c < 2048) {
        n += String.fromCharCode((c >> 6) | 192);
        n += String.fromCharCode((c & 63) | 128);
      } else {
        n += String.fromCharCode((c >> 12) | 224);
        n += String.fromCharCode(((c >> 6) & 63) | 128);
        n += String.fromCharCode((c & 63) | 128);
      }
    }
    return n;
  }
  function G(e: number[], d: number) {
    return (e[(d >> 5)] >>> (d % 32)) | (e[(d >> 5) + 1] << (32 - (d % 32)));
  }
  function n(d: number[], F: number, k: number, H: number, x: number, s: number, q: number) {
    F = K(F, K(K((d[F >>> 2] >>> ((F % 4) * 8)) & 255, k), q));
    return K(L(F, s), x);
  }
  // fallback simple implementation: use built-in Web Crypto via SHA-1 if MD5 not needed
  // but here we include a compact JS MD5 algorithm to avoid external deps.
  // Use a small known implementation for correctness.
  // For brevity and reliability, use a tiny implementation below.
  function toHex(i: number) {
    let j = "", n = 0;
    for (; n <= 3; n++) {
      j += ("0" + ((i >>> (n * 8)) & 255).toString(16)).slice(-2);
    }
    return j;
  }

  // Simple (but reliable) md5 implementation from https://www.myersdaily.org/joseph/javascript/md5-text.html
  /* eslint-disable no-bitwise */
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add32(L(add32(add32(a, q), add32(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function md51(s: string) {
    let txt = '';
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = new Array(16).fill(0);
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  function md5blk(s: string) {
    const md5blks = [] as number[];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }
  const result = md51(str);
  return toHex(result[0]) + toHex(result[1]) + toHex(result[2]) + toHex(result[3]);
}


export default function AuthControls() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data.user ?? null);

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            }),
          });
        }

        // subscribe to auth changes
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          setUser(session?.user ?? null);
          if (session?.access_token) {
            fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            }).catch(() => {
              // ignore server cookie sync failures
            });
          }
        });

        return () => {
          sub.subscription.unsubscribe();
        };
      } catch (e) {
        // Supabase not configured or error
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    const maybe = init();
    return () => {
      mounted = false;
      maybe && (maybe as any).then && (maybe as any).then((cleanup: any) => cleanup && cleanup());
    };
  }, []);

  async function handleLogout() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setMsg("Logged out");
      trackEvent('logout', { user: user?.email });
      setTimeout(() => setMsg(null), 2500);
      router.push("/login");
    } catch (e) {
      setMsg("Logout failed");
      trackEvent('logout_failed', { error: String(e) });
      setTimeout(() => setMsg(null), 2500);
    }
  }

  if (loading) return <div className="auth-controls">…</div>;

  if (!user) {
    return (
      <div className="auth-controls row">
        <Link href="/login" className="site-nav-link auth-link">Log in</Link>
        <Link href="/register" className="btn btn-gold auth-cta">Register</Link>
      </div>
    );
  }

  const name = user.user_metadata?.full_name ?? user.email ?? "User";
  const avatar = user.user_metadata?.avatar_url ?? null;
  const email = (user.email ?? "").toString().trim().toLowerCase();
  const gravatar = email ? `https://www.gravatar.com/avatar/${md5(email)}?s=128&d=identicon` : null;
  const unavatar = `https://unavatar.io/${encodeURIComponent(user.email ?? name)}`;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=10b981&color=ffffff&rounded=true&size=128`;

  return (
    <div className="auth-controls row" style={{ alignItems: "center" }}>
      <img
        src={avatar ?? gravatar ?? unavatar ?? fallbackAvatar}
        alt={name}
        style={{ width: 32, height: 32, borderRadius: 999, objectFit: "cover", marginRight: 8 }}
      />

      <span className="text-muted-sm" style={{ marginRight: "0.5rem" }}>{String(name).split(" ")[0]}</span>
      {(user.user_metadata?.role === "tipster" || user.user_metadata?.role === "admin") ? (
        <Link href="/tipster/dashboard" className="btn btn-link" style={{ marginRight: "0.5rem" }}>My tips</Link>
      ) : null}
      {user.user_metadata?.role === "admin" ? <Link href="/admin" className="btn btn-primary" style={{ marginRight: "0.5rem" }}>Admin</Link> : null}
      <button
        type="button"
        onClick={handleLogout}
        className="btn btn-logout"
        aria-label="Log out"
        title="Log out"
      >
        <svg
          className="btn-logout-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Log out</span>
      </button>

      {msg ? <div className="badge badge--pitch" style={{ marginLeft: 8 }}>{msg}</div> : null}
    </div>
  );
}
