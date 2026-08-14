const fs = require('fs');
const path = require('path');

const homePagePath = path.resolve('src/pages/portal/HomePage.ts');
let content = fs.readFileSync(homePagePath, 'utf8');

// Replace headings in verify methods
content = content.replace(/hasText: \/\^Source\$\/i/g, "hasText: /^Publishers & Databases$/i");
content = content.replace(/hasText: \/\^SECTION\$\/i/g, "hasText: /^Browse by Section$/i");
content = content.replace(/hasText: \/\^Subject\$\/i/g, "hasText: /^Academic Subjects$/i");
content = content.replace(/hasText: \/\^Content\$\/i/g, "hasText: /^Content Types$/i");
content = content.replace(/hasText: \/\^Course\$\/i/g, "hasText: /^Course Materials$/i");
content = content.replace(/hasText: \/\^Useful Links\$\/i/g, "hasText: /^Quick Links$/i");

// Update getWidgetContainer to map names if they use the old ones
content = content.replace(
  `getWidgetContainer(headingName: string): Locator {
    return this.page.locator('.grp-widget-title', { hasText: new RegExp(\`^\${headingName}$\`, 'i') })`,
  `getWidgetContainer(headingName: string): Locator {
    const mappings: Record<string, string> = {
      'Source': 'Publishers & Databases',
      'SECTION': 'Browse by Section',
      'Subject': 'Academic Subjects',
      'Content': 'Content Types',
      'Course': 'Course Materials',
      'Useful Links': 'Quick Links'
    };
    const mappedName = mappings[headingName] || headingName;
    // Need to escape & if used in regex directly, or just match exactly if possible, but new RegExp handles it fine.
    return this.page.locator('.grp-widget-title', { hasText: new RegExp(\`^\${mappedName}$\`, 'i') })`
);

// Update viewAll navigation check to use mapped name for the page heading
content = content.replace(
  `const pageHeading = this.page.locator('.grp-widget-title', { hasText: new RegExp(\`^\${widgetName}$\`, 'i') });`,
  `const mappings: Record<string, string> = {
      'Source': 'Publishers & Databases',
      'SECTION': 'Browse by Section',
      'Subject': 'Academic Subjects',
      'Content': 'Content Types',
      'Course': 'Course Materials',
      'Useful Links': 'Quick Links'
    };
    const mappedName = mappings[widgetName] || widgetName;
    const pageHeading = this.page.locator('.grp-widget-title', { hasText: new RegExp(\`^\${mappedName}$\`, 'i') });`
);

fs.writeFileSync(homePagePath, content);
console.log('Updated HomePage.ts');

const specPath = path.resolve('tests/portal/HomePage/homepage-result.spec.ts');
let specContent = fs.readFileSync(specPath, 'utf8');

// The spec has an expected order test:
specContent = specContent.replace(
  `const expectedWidgets = [
            'Source',
            'SECTION',
            'Subject',
            'Content',
            'Course',
            'Useful Links'
        ];`,
  `const expectedWidgets = [
            'Browse by Section',
            'Publishers & Databases',
            'Academic Subjects',
            'Content Types',
            'Course Materials',
            'Quick Links'
        ];`
);

fs.writeFileSync(specPath, specContent);
console.log('Updated homepage-result.spec.ts');
