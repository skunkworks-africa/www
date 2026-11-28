import { members } from './team-members.mjs';

(() => {
  const directory = document.querySelector('[data-team-grid]');
  const profile = document.querySelector('[data-member-profile]');
  const main = document.querySelector('main#main');
  if (!directory || !profile || !main) return;

  const title = document.title;
  const sections = [...main.children].filter(node => node.tagName === 'SECTION' && node !== profile);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const tagList = skills => '<ul class="team-skills" aria-label="Skillsets">' +
    skills.map(skill => '<li>' + escape(skill) + '</li>').join('') + '</ul>';
  const memberLink = member => '#company/' + encodeURIComponent(member.slug);

  directory.innerHTML = members.map(member => `
    <article class="team-card">
      <div class="team-card__identity">
        <div class="team-monogram" aria-hidden="true">${escape(member.initials)}</div>
        <div>
          <p class="team-card__group">${escape(member.group)}</p>
          <h3><a href="${memberLink(member)}">${escape(member.name)}</a></h3>
          <p class="team-card__title"><a href="${memberLink(member)}">${escape(member.title)}</a></p>
        </div>
      </div>
      <p class="team-card__summary">${escape(member.summary)}</p>
      ${tagList(member.skills.slice(0, 4))}
      <a class="team-card__more" href="${memberLink(member)}" aria-label="View ${escape(member.name)}'s full profile">View profile <span aria-hidden="true">→</span></a>
    </article>`).join('');

  const render = member => {
    const backLink = '<a class="team-back" href="#team">← Back to our people</a>';
    if (!member) {
      profile.innerHTML = `${backLink}<h1 tabindex="-1">Profile not found</h1><p>This member profile is not available. Browse the current directory instead.</p>`;
      return;
    }
    profile.innerHTML = `
      ${backLink}
      <div class="team-profile__intro">
        <div class="team-monogram team-monogram--large" aria-hidden="true">${escape(member.initials)}</div>
        <div>
          <p class="eyebrow">${escape(member.group)}</p>
          <h1 tabindex="-1">${escape(member.name)}</h1>
          <p class="team-profile__title">${escape(member.title)}</p>
          <p class="team-profile__lead">${escape(member.summary)}</p>
        </div>
      </div>
      <div class="team-profile__content">
        <div>
          <h2>About ${escape(member.name.split(' ')[0])}</h2>
          <p>${escape(member.biography)}</p>
          <h2>Areas of work</h2>
          <div class="team-profile__roles">${member.responsibilities.map(item => `
            <section><h3>${escape(item.heading)}</h3><p>${escape(item.detail)}</p></section>`).join('')}</div>
        </div>
        <aside class="team-profile__aside">
          <h2>Skillsets & focus</h2>
          ${tagList(member.skills)}
          ${member.publicLink ? `<p><a href="${escape(member.publicLink.url)}" rel="noopener noreferrer" target="_blank">${escape(member.publicLink.label)} ↗</a></p>` : ''}
          <a class="button button-primary" href="mailto:sales@skunkworks.africa?subject=${encodeURIComponent('Skunkworks enquiry: ' + member.name)}">Contact Skunkworks</a>
          <p class="team-profile__note">Business enquiries are routed through our central sales team. No private staff contact details are published.</p>
        </aside>
      </div>`;
  };

  const route = () => {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); }
    catch { hash = 'company/invalid'; }
    const isProfile = hash.startsWith('company/');
    const member = isProfile ? members.find(item => hash === 'company/' + item.slug) : null;
    sections.forEach(section => { section.hidden = isProfile; });
    profile.hidden = !isProfile;
    if (isProfile) {
      render(member);
      document.title = member
        ? `${member.name} | ${member.title} | Skunkworks Africa`
        : 'Profile not found | Skunkworks Africa';
      window.scrollTo(0, 0);
      profile.querySelector('h1')?.focus({ preventScroll: true });
    } else {
      document.title = title;
      if (hash && !hash.includes('/')) {
        requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
      }
    }
  };

  window.addEventListener('hashchange', route);
  route();
})();
