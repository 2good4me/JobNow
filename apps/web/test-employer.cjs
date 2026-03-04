const puppeteer = require('puppeteer-core');

(async () => {
    console.log("Launching browser via existing installation...");
    // Find local system chrome
    const browser = await puppeteer.connect({ 
        browserURL: 'http://127.0.0.1:9222', 
    }).catch(async () => {
       console.log("Could not connect to existing. Trying to use system chrome");
       return await puppeteer.launch({ 
         executablePath: '/usr/bin/google-chrome',
         args: ['--no-sandbox', '--disable-setuid-sandbox'],
         headless: 'new'
       });
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 }); // Mobile viewport

    console.log("Navigating to register...");
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
    
    console.log("Filling form...");
    await page.type('input[type="email"]', `emp${Date.now()}@jobnow.com`);
    await page.type('input[type="password"]', 'password123');
    
    const confirmInputs = await page.$$('input[type="password"]');
    if (confirmInputs.length > 1) {
        await confirmInputs[1].type('password123');
    }

    console.log("Selecting role...");
    const roleLabels = await page.$$('h3');
    for (const label of roleLabels) {
        const text = await page.evaluate(el => el.textContent, label);
        if (text.includes('Nhà tuyển dụng')) {
            await label.evaluate(el => el.parentElement.parentElement.click());
            console.log("Role clicked");
            break;
        }
    }
    
    console.log("Submitting...");
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Đăng ký')) {
            await btn.click();
            break;
        }
    }
    
    console.log("Waiting for onboarding redirect...");
    await new Promise(r => setTimeout(r, 4000));
    
    // Fill out onboarding
    const nameInput = await page.$('input[name="fullName"], input[placeholder*="Ví dụ:"]');
    if (nameInput) await nameInput.type('Nguyen Van Emp');
    
    const nextBtnList = await page.$$('button');
    for (const btn of nextBtnList) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Hoàn tất') || text.includes('Xác nhận')) {
            await btn.click();
            const rect = await btn.boundingBox();
            if (rect) await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
            break;
        }
    }

    console.log("Waiting for dashboard...");
    await new Promise(r => setTimeout(r, 4000));
    
    await page.screenshot({ path: '/home/pind/.gemini/antigravity/brain/46b4b700-3f3b-4e1b-be29-ef00938d24de/employer_dashboard.png' });
    
    console.log("Navigating to profile");
    await page.goto('http://localhost:3000/employer/profile', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: '/home/pind/.gemini/antigravity/brain/46b4b700-3f3b-4e1b-be29-ef00938d24de/employer_profile.png' });
    
    await browser.close();
    console.log("Done");
})();
