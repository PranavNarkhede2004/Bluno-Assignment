// Cache buster script - forces reload on each deployment
window.addEventListener('load', () => {
  // Force reload if cache is detected
  const buildTime = '2026-04-28T11:20:00Z';
  const lastBuild = localStorage.getItem('lastBuild');
  
  if (lastBuild !== buildTime) {
    localStorage.setItem('lastBuild', buildTime);
    if (lastBuild) {
      console.log('New build detected, forcing refresh...');
      window.location.reload(true);
    }
  }
});
