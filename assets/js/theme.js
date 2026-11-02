/* Thème avant le premier rendu (fichier externe : CSP sans unsafe-inline). */
(function(){try{var t=localStorage.getItem('g1650-theme');
if(!t)t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
document.documentElement.setAttribute('data-theme',t);
if(t==='light'){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#F4F0E9');}
}catch(e){}})();
