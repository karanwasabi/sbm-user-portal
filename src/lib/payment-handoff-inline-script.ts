import { PAYMENT_HANDOFF_EMAIL_COOKIE } from '@/lib/payment-handoff';

/** Runs synchronously before React paints to forward Supabase auth callbacks off /login. */
export const PAYMENT_HANDOFF_LOGIN_INLINE_SCRIPT = `(function(){try{
var h=location.hash||'';
var s=location.search||'';
var q=new URLSearchParams(s);
var hp=new URLSearchParams(h.startsWith('#')?h.slice(1):h);
var hasAuth=!!q.get('code')||(hp.get('access_token')&&hp.get('refresh_token'))||hp.get('error');
if(!hasAuth)return;
var email=q.get('email')||'';
if(!email){
  var prefix='${PAYMENT_HANDOFF_EMAIL_COOKIE}=';
  var parts=document.cookie?document.cookie.split(';'):[];
  for(var i=0;i<parts.length;i++){
    var part=parts[i].trim();
    if(part.indexOf(prefix)===0){email=decodeURIComponent(part.slice(prefix.length));break;}
  }
}
if(!email)return;
var dest='/register/open-payment-link?email='+encodeURIComponent(email);
var code=q.get('code');
if(code)dest+='&code='+encodeURIComponent(code);
var expired=hp.get('error')==='access_denied'&&(hp.get('error_code')==='otp_expired'||hp.get('error_code')==='otp_disabled'||hp.get('error_description'));
if(expired||hp.get('error'))dest+='&expired=1';
location.replace(dest+h);
}catch(e){}})();`;
