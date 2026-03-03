import { NavLink, useParams } from "react-router-dom";
import { useTranslations } from "../../hooks/useTranslations";

const languages = ["uz", "eng", "ru"] as const;
type Lang = (typeof languages)[number];

const Footer = () => {
  const { lang: urlLang } = useParams<{ lang?: string }>();
  const t = useTranslations();

  const lang: Lang = languages.includes(urlLang as Lang)
    ? (urlLang as Lang)
    : "uz";

  const f = t.footer;

  return (
    <footer className="pb-6">
      {/* CARD */}
      <div className="rounded-2xl border-t border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pt-12">
        {/* TOP */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* BRAND */}
          <div>
            <h3 className="text-lg font-semibold text-white">Akhmads.net</h3>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              {f?.brandDesc}
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80">
              {f?.platformTitle}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <NavLink to={`/${lang}`} className="hover:text-white">
                  {f?.links.home}
                </NavLink>
              </li>
              <li>
                <NavLink to={`/${lang}/launch-ad`} className="hover:text-white">
                  {f?.links.launchAd}
                </NavLink>
              </li>
              <li>
                <NavLink to={`/${lang}/add-bot`} className="hover:text-white">
                  {f?.links.addBot}
                </NavLink>
              </li>
              <li>
                <NavLink to={`/${lang}/wallet`} className="hover:text-white">
                  {f?.links.wallet}
                </NavLink>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80">
              {f?.supportTitle}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <NavLink to={`/${lang}/faq`} className="hover:text-white">
                  {f?.links.faq}
                </NavLink>
              </li>
              <li>
                <NavLink to={`/${lang}/support`} className="hover:text-white">
                  {f?.links.support}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px w-full bg-white/10" />

        {/* BOTTOM */}
        <div className="pb-6 text-center text-xs text-white/40 space-y-1">
          <p>{f?.copyright}</p>
          <p>{f?.taxNotice}</p>
          <p>{f?.complianceNotice}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
