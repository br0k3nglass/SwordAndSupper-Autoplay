const { chromium } = require('playwright');

async function navigateShadowDOM(element, selectors) {
    let currentElement = element;
    for (const selector of selectors) {
        if (selector === 'shadowRoot') {
            currentElement = await currentElement.evaluateHandle(el => el.shadowRoot);
        } else {
            currentElement = await currentElement.$(selector);
        }
        if (!currentElement) {
            throw new Error(`Element not found with selector: ${selector}`);
        }
    }
    return currentElement;
}

async function clickDevvitElement(page) {
    // Define the path through shadow DOMs using a sequence of selectors
    const shadowPath = [
        'devvit-post-consume-tracker',
        'shadowRoot',
        'div > devvit-surface',
        'shadowRoot',
        'div > devvit-blocks-renderer',
        'shadowRoot',
        'div > div > div > div > div:nth-child(6) > div.box-border.overflow-hidden.relative.shrink-0.grid.grid-cols-1.dx-zstack.auto-cols-fr.auto-rows-fr.p-0.justify-items-start.items-start.border-0.rounded-none.pointer-events-none.\\[\\&\\>\\:not\\(\\.pointer-events-none\\)\\]\\:pointer-events-auto > div.box-border.overflow-hidden.relative.shrink-0.flex.flex-row.p-0.justify-center.items-center.border-0.rounded-none.pointer-events-none.\\[\\&\\>\\:not\\(\\.pointer-events-none\\)\\]\\:pointer-events-auto > div.box-border.overflow-hidden.relative.shrink-0.flex.flex-row.p-0.justify-center.items-start.border-0.rounded-none.pointer-events-none.\\[\\&\\>\\:not\\(\\.pointer-events-none\\)\\]\\:pointer-events-auto > div'
    ];

    try {
        // Start from the main document
        let currentHandle = await page.$('body');
        
        for (const selector of shadowPath) {
            if (selector === 'shadowRoot') {
                currentHandle = await currentHandle.evaluateHandle(el => el.shadowRoot);
            } else {
                currentHandle = await currentHandle.$(selector);
            }
            
            if (!currentHandle) {
                throw new Error(`Failed to find element with selector: ${selector}`);
            }
        }

        // Verify the image exists under this DIV
        const hasTargetImage = await currentHandle.$eval('img', (img, targetSrc) => {
            return img.src === targetSrc;
        }, 'https://i.redd.it/3kg6d3isvyre1.png');

        if (hasTargetImage) {
            await currentHandle.click();
            console.log('Successfully clicked the target DIV element');
            return true;
        } else {
            console.log('Target image not found under the DIV');
            return false;
        }

    } catch (error) {
        console.error('Error navigating shadow DOM:', error.message);
        return false;
    }
}

async function automateRedditProcess() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    const visitedPosts = new Set();

    try {
        // Step 1: Navigate to the filtered Reddit page
        console.log('Navigating to Reddit...');
        await page.goto('https://www.reddit.com/r/SwordAndSupperGame/?f=flair_name%3A%22Level%2061-80%22', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Step 2: Wait for posts to load
        await page.waitForSelector('[data-testid="post-title"]', { timeout: 10000 });

        // Step 3: Find and click the first unopened post
        const postLinks = await page.$$('[data-testid="post-title"]');
        let postClicked = false;

        for (const postLink of postLinks) {
            const href = await postLink.getAttribute('href');
            if (href && !visitedPosts.has(href)) {
                visitedPosts.add(href);
                console.log('Clicking post:', href);
                await postLink.click();
                postClicked = true;
                break;
            }
        }

        if (!postClicked) {
            console.log('No unopened posts found');
            await browser.close();
            return;
        }

        // Step 4: Wait for the post page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Additional wait for dynamic content

        // Step 5: Click the Devvit element in shadow DOM
        console.log('Attempting to click Devvit element...');
        const success = await clickDevvitElement(page);
        
        if (success) {
            console.log('Devvit app interaction successful');
            // Add your app interaction logic here
            await page.waitForTimeout(2000);
        } else {
            console.log('Failed to interact with Devvit app');
        }

        // Optional: Add logic to loop back and continue with next post
        // await page.goBack();
        // await automateRedditProcess(); // Recursive call

    } catch (error) {
        console.error('Error during automation:', error);
    } finally {
        // Keep browser open for debugging, remove in production
        // await browser.close();
    }
}

// Alternative approach using evaluate for complex shadow DOM traversal
async function clickDevvitElementAlternative(page) {
    return await page.evaluate(() => {
        function findElementWithImage(root, targetSrc) {
            // Recursively search through shadow DOMs
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_ELEMENT,
                {
                    acceptNode: function(node) {
                        if (node.shadowRoot) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        if (node.tagName === 'IMG' && node.src === targetSrc) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_SKIP;
                    }
                }
            );

            let currentNode = walker.nextNode();
            while (currentNode) {
                if (currentNode.tagName === 'IMG' && currentNode.src === targetSrc) {
                    return currentNode.closest('div');
                }
                if (currentNode.shadowRoot) {
                    const result = findElementWithImage(currentNode.shadowRoot, targetSrc);
                    if (result) return result;
                }
                currentNode = walker.nextNode();
            }
            return null;
        }

        const targetDiv = findElementWithImage(document, 'https://i.redd.it/3kg6d3isvyre1.png');
        if (targetDiv) {
            targetDiv.click();
            return true;
        }
        return false;
    });
}

// Run the automation
automateRedditProcess().catch(console.error);