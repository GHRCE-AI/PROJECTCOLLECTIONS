import { Star } from 'lucide-react';

const REPO_URL = 'https://github.com/MrSpideyNihal/Findmeproject';

export default function StarBanner() {
  return (
    <div className="star-banner" role="complementary">
      <Star size={15} className="star-twinkle" fill="currentColor" aria-hidden="true" />
      <span className="star-banner-text">Enjoying ProjectHub? Give it a star on GitHub</span>
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Star this repository on GitHub">
        <Star size={13} fill="currentColor" /> Star
      </a>
    </div>
  );
}
