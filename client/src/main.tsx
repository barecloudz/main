import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add meta description for SEO
if (!document.querySelector('meta[name="description"]')) {
  const metaDescription = document.createElement('meta');
  metaDescription.name = 'description';
  metaDescription.content = 'BareCloudz is a modern marketing agency offering digital marketing, SEO, social media, and PPC services with guaranteed growth results. Get a free consultation today.';
  document.head.appendChild(metaDescription);
}

// Add title if not present
if (!document.title) {
  document.title = 'BareCloudz - Modern Marketing Solutions';
}

// Add Open Graph tags for better social media sharing
const ogTags = [
  { property: 'og:title', content: 'BareCloudz - Modern Marketing Solutions' },
  { property: 'og:description', content: 'Elevate your brand with our cloud-based marketing strategies that deliver real results.' },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: window.location.href },
  { property: 'og:site_name', content: 'BareCloudz' }
];

ogTags.forEach(tag => {
  if (!document.querySelector(`meta[property="${tag.property}"]`)) {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('property', tag.property);
    metaTag.content = tag.content;
    document.head.appendChild(metaTag);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
