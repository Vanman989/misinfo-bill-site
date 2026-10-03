/* How to schedule and automate posting. Researched 4 October 2026; prices and
   limits change, so each line links to the page it came from. */
const HOWTO = '<div class="how">' +

'<div class="warn"><b>Before anything goes out:</b> put the promoter statement (name plus an address, email, PO box, phone, or a link to a page with them) in the bio or About section of every account. ' +
'The Electoral Commission says that covers normal posts. Boosted or paid posts must carry it on the ad itself, which these images already do. ' +
'All election advertising must stop by the end of Friday 6 November 2026, and nothing new can go out on election day, 7 November. ' +
'<a href="https://elections.nz/guidance-and-rules/advertising-and-campaigning/social-media" target="_blank" rel="noopener">Electoral Commission: social media</a></div>' +

'<h3>The easy way: free, about 15 minutes a week</h3>' +
'<ol>' +
'<li><b>Download everything</b> with the button above. You get every image at the right size, a captions file per platform, and <code>schedule.csv</code> with a date for each post.</li>' +
'<li><b>Facebook and Instagram:</b> Meta Business Suite schedules both for free, from one screen. Add the image, paste the caption, pick the date.</li>' +
'<li><b>LinkedIn:</b> schedule natively for free from the post box (clock icon), up to three months ahead. <a href="https://buffer.com/resources/how-to-schedule-linkedin-posts/" target="_blank" rel="noopener">How</a></li>' +
'<li><b>X:</b> schedule from the desktop website (calendar icon in the post box). One report says this became Premium-only in June 2026. <a href="https://postplanify.com/blog/schedule-posts-on-x" target="_blank" rel="noopener">How</a></li>' +
'<li><b>Threads:</b> native scheduling, up to 75 days ahead. <a href="https://adaptlypost.com/en/blog/how-to-schedule-threads-posts" target="_blank" rel="noopener">How</a></li>' +
'<li><b>TikTok:</b> schedule from TikTok Studio on a computer (not the phone app), with a Creator or Business account.</li>' +
'</ol>' +

'<h3>One place for everything: Buffer</h3>' +
'<p>Buffer posts to Instagram, Facebook, LinkedIn, X, Threads, Bluesky and TikTok from one queue.</p>' +
'<ul>' +
'<li><b>Free:</b> 3 accounts, 10 scheduled posts each. That is exactly this set of 10 posts on, say, Instagram, Facebook and X.</li>' +
'<li><b>Essentials:</b> $5 USD per account per month. All seven platforms is about $35 USD a month.</li>' +
'<li><b>Bulk upload:</b> on every plan you can upload a CSV of posts (text and one image each; 10 per upload on free, 100 on paid). Use Buffer’s own template and copy the dates and captions across from <code>schedule.csv</code>.</li>' +
'</ul>' +
'<p class="src"><a href="https://buffer.com/pricing" target="_blank" rel="noopener">Buffer pricing</a> · <a href="https://support.buffer.com/articles/how-to-upload-posts-in-bulk-to-buffer-cTIhl4mv6H" target="_blank" rel="noopener">Buffer bulk upload</a></p>' +

'<div class="scroll"><table><thead><tr><th>Tool</th><th>Free plan</th><th>Paid from</th><th>CSV bulk upload</th></tr></thead><tbody>' +
'<tr><td>Buffer</td><td>3 accounts, 10 posts each</td><td>$5/account/month</td><td>Yes, all plans</td></tr>' +
'<tr><td>Metricool</td><td>1 brand, 20 posts a month, no LinkedIn or X</td><td>about $20/month</td><td>Yes</td></tr>' +
'<tr><td>Publer</td><td>3 accounts, 10 posts each, no X</td><td>about $4/account/month</td><td>Yes (5 on free)</td></tr>' +
'<tr><td>Later</td><td>None</td><td>$18.75/month</td><td>Media only</td></tr>' +
'<tr><td>Hootsuite</td><td>None</td><td>$99/user/month</td><td>Yes</td></tr>' +
'</tbody></table></div>' +
'<p class="src">Prices in USD, from each tool’s pricing page in October 2026: <a href="https://metricool.com/pricing/" target="_blank" rel="noopener">Metricool</a> · <a href="https://later.com/pricing/" target="_blank" rel="noopener">Later</a> · <a href="https://www.hootsuite.com/plans" target="_blank" rel="noopener">Hootsuite</a>. Publer’s figures come from a third-party review and may be out of date.</p>' +

'<h3>Fully automatic: a sheet that posts itself</h3>' +
'<p>Put the posts in a Google Sheet (date, platform, caption, image link). A free automation tool reads the sheet and posts each row at its time.</p>' +
'<ul>' +
'<li><b>n8n</b> (free if you run it yourself) or <b>Make</b> (free for 2 automations) does the reading and posting. <a href="https://www.make.com/en/pricing" target="_blank" rel="noopener">Make pricing</a> · <a href="https://docs.n8n.io/choose-how-to-use-n8n.md" target="_blank" rel="noopener">n8n</a></li>' +
'<li><b>Facebook Page:</b> free API, can schedule 10 minutes to 30 days ahead. <a href="https://developers.facebook.com/docs/pages-api/posts" target="_blank" rel="noopener">Docs</a></li>' +
'<li><b>Instagram:</b> free API for a Business or Creator account, up to 100 posts a day, JPEG images. Posting to your own accounts needs no Meta app review. <a href="https://developers.facebook.com/docs/instagram-platform/content-publishing/" target="_blank" rel="noopener">Docs</a></li>' +
'<li><b>Threads:</b> free API, 250 posts a day. <a href="https://developers.facebook.com/docs/threads/posts" target="_blank" rel="noopener">Docs</a></li>' +
'<li><b>Bluesky:</b> free, log in with an app password. <a href="https://github.com/bluesky-social/atproto/blob/main/packages/api/README.md" target="_blank" rel="noopener">Docs</a></li>' +
'<li><b>LinkedIn:</b> free for a personal profile (Share on LinkedIn). Posting as a Page needs LinkedIn’s manual approval, which is meant for registered organisations. <a href="https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin" target="_blank" rel="noopener">Docs</a></li>' +
'<li><b>X:</b> pay per post: $0.015 USD, or $0.20 USD if the post has a link. No free posting tier. <a href="https://docs.x.com/x-api/getting-started/pricing" target="_blank" rel="noopener">Pricing</a></li>' +
'</ul>' +

'<h3>Paying to boost posts</h3>' +
'<ul>' +
'<li><b>Facebook and Instagram:</b> political ads need Meta’s authorisation and a “Paid for by” label. <a href="https://transparency.meta.com/en-gb/policies/ad-standards/SIEP-advertising/SIEP/" target="_blank" rel="noopener">Meta policy</a></li>' +
'<li><b>LinkedIn and TikTok:</b> paid political ads are banned. Normal posts are fine. <a href="https://members.linkedin.com/legal/ads-policy" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-politics-government-and-elections" target="_blank" rel="noopener">TikTok</a></li>' +
'<li><b>Spending:</b> spend more than $17,000 including GST on election advertising and you must register with the Electoral Commission as a third-party promoter.</li>' +
'</ul>' +
'</div>';
