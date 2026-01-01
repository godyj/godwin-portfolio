export type ContentBlock =
  | { type: 'text'; content: string; centered?: boolean; size?: 'normal' | 'large' }
  | { type: 'image'; src: string; alt: string; maxWidth?: number; noLightbox?: boolean }
  | { type: 'images'; items: Array<{ src: string; alt: string }>; maxWidth?: number }
  | { type: 'video'; src: string; caption?: string; maxWidth?: number }
  | { type: 'notice'; content: string; color?: 'red' | 'gray' };

export interface ProjectSection {
  title?: string;
  content?: string;
  images?: Array<{
    src: string;
    alt: string;
  }>;
  // New: supports inline content blocks for exact layout matching
  blocks?: ContentBlock[];
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  // Layout options: 'default' shows hero+header, 'content-first' skips hero/header
  layout?: 'default' | 'content-first';
  thumbnail: string;
  year: string;
  month?: string;
  role: string;
  skills: string[];
  results?: string;
  sections: ProjectSection[];
  confidential?: boolean;
}

export const projects: Project[] = [
  {
    id: "humanics-calendar-sharing",
    title: "Humanics",
    subtitle: "Calendar Sharing",
    description: "Humanics is a workforce management solution for nurses and nurse supervisors. The product has 2 parts: a desktop web app and a mobile app (iOS/Android).",
    category: "Product Design",
    thumbnail: "/images/projects/humanics-calendar.png",
    year: "2019",
    month: "July",
    role: "Principal UI/UX Designer",
    skills: ["Feature Strategy", "UI", "UX", "IA", "Prototype", "Research"],
    confidential: true,
    sections: [
      {
        title: "Role & Context",
        content: `As the Principal UI/UX designer, my primary tent pole goal for this feature was to maintain utmost privacy of the end user's personal calendar data while still designing the best human experience possible. I also wanted to make sure all iOS visual and interaction designs followed Apple's latest human interface guidelines.

The customer success team and design research came to understand that nursing staff using the mobile app needed the ability to share their Humanics calendar with family and friends along with the ability to view their work schedule in the context of their personal calendar. Based on that, I worked with the product manager to help outline and prioritize all of the feature requirements so I could get started on the design side.`
      },
      {
        title: "Stakeholders & Partners",
        content: `The primary team consisted of the following folks:

– Head of Design
– Head of Engineering
– Head of Product/GM
– Head of Customer Success
– Head of Business Development & Sales
– 1 Design Researcher
– 1 Nursing Domain Expert
– 1 Design Product Manager
– 1 Engineering Product Manager
– 1 iOS Engineer
– 1 Android engineer
– 1 Back-end Engineer
– 1 QA Engineer`
      },
      {
        title: "Why Calendar Sharing?",
        content: `The customer success team identified a pain point that nursing staff were unable to share their work schedule with family and friends to plan their lives. Staff were frequently sending screenshots of their Humanics calendar to friends and family but this wasn't the ideal experience we wanted to provide. Not only that, the Humanics calendar is designed more specifically to view and manage hospital shifts and less as a typical calendar.

Secondarily the team also identified the need for staff to view their work schedules alongside their personal schedules in their default calendar app of their devices. Staff were bouncing between their default calendar app and Humanics when planning life events, which wasn't a pleasant experience either.

Based on the above discovery I accompanied our design researcher to the hospital to ask a few deeper questions. Based on my research session I boiled down calendar sharing to 2 categories: short term and long term sharing.`
      },
      {
        title: "Short Term Calendar Sharing",
        content: `I discovered that the unmarried nursing staff wanted the ability to share their work schedule with significant others, friends and family to plan life events. However, what was interesting in this case was that they didn't want recipients of their shared calendar to have continuous access to their schedule.

Also, they only wanted to share a short defined period (1-2 weeks) because they were not comfortable with friends having extended access to their work schedule. This brought up some interesting ideas for how to design for short term and short period sharing. This was intriguing but it was also a question of priority for this phase of the feature.`
      },
      {
        title: "Long Term Calendar Sharing",
        content: `The married ones on the other hand simply wanted the ability to share their work schedules with spouses to plan family life events. They didn't specify a need to stop sharing their work schedules at any point in time in the near future nor did they ask for sharing shorter calendar periods. This case was fairly straightforward, the most common and thus the lowest hanging fruit to quickly design, build and release for immediate use.`
      },
      {
        title: "Calendar App on Device",
        content: `The majority of our users use their default calendar app on their devices to view and manage their personal schedules. They wanted their work schedule to augment their personal schedule. It felt natural for them to view their work schedules alongside their personal one when planning life events.`
      },
      {
        title: "Round 1 & Feature Exploration",
        content: `My initial design leveraged the calendar sharing capability of iOS (and Android) to keep things simple and straightforward. I based this on what other apps and competitors were doing because I didn't want to invent anything new unless there was a clear need. I looked at apps such as NurseGrid, MyDuty and Deliveries. Based on my research I was a little hesitant with this approach because users had to allow access to their calendar data.

Not only that, my hypothesis was this design wouldn't be as intuitive and may require some planning and technical knowledge on the part of the user when sharing their schedule with friends. My other hypothesis was, it could be straightforward for married staff who already have a shared calendar. When I interviewed staff, my hypothesis was proved right as users did not know how to share a calendar (on iOS or Android)

The screens below are showing the key screens for the initial design. The following descriptions start with the screens below from the left.

1. System level app settings with calendar access toggle
2. In-app settings showing Calendar Sync option off
3. Calendar Sync detail screen in OFF state
4. Calendar Sync detail screen in ON state with first calendar selected by default.

I created this interaction flow document for the product manager and the engineering team.

This design approach was less work for me and the engineering team but it wasn't ideal for our users, and so I didn't recommend this approach. It also required access to the user's calendar even though we only needed access to write data (not read) but the user does not know that. I felt it is important to avoid even asking for access when possible. In addition, this approach was not of much value from a product sales perspective. We thus ended up shelving it.`
      },
      {
        title: "It's Complicated",
        content: `Calendar sharing is complicated and not as simple as it sounds. I am a strong proponent of user data privacy and as much as possible I try to avoid accessing user data even if there is a strong need to do so. I always advise my team and all stakeholders of the same. I also wanted to try my best to protect our users from themselves. What does that mean?

It means … unintentional sharing of personal data. The sharing experience needed to be designed with as much transparency and clarity as possible to guide users down the safest path possible while making the interface and workflow intuitive — I needed to strike a very fine balance.

Nursing staff are intelligent humans but my research suggested they aren't quite tech savvy. The Calendar sharing action doesn't just end when you share it with another human, like when sharing a link or photo. This concept was not very clear to nurses.

When a user shares a calendar, personal data continues to flow to the recipient till the initiator decides to stop sharing. This could potentially lead to stalking and other unexpected social issues which I wanted the team to be cognizant of.

Since privacy was paramount, I worked with the Head of Engineering and came to the agreement that we needed to provide a UI for users to know whom they've shared their calendar with, who still has access to their shared calendar, and to manage access.

Shared calendar access and management is already provided by mobile operating systems. However, during the research phase, I discovered that most staff did not know how to share a calendar from their default calendar apps using their mobile operating systems. This not only was a problem, but the business development team saw it as a feature to tout from the sales perspective because we would be able to control the experience from within Humanics. The advantage we have is our users are more familiar with Humanics than system level calendar settings. I thus decided to design a custom solution for managing shared calendars.`
      },
      {
        title: "Brainstorming for Round 2",
        content: `I explored some ideas and flows with the Product Manager and Head of Design before I started creating higher fidelity mockups for review.

I explored a flow for short term calendar sharing which I later shelved for a future release because it was out of scope for this release from an engineering standpoint.

I explored the possibility of using QR codes as the primary method of sharing the calendar URL. This was based on the hypothesis that it would be the safest and quickest. However, QR codes did not resonate with nurses when I got to the design validation stage.

Text messaging was generally preferred so I ended up using the standard mobile OS share sheet.`
      },
      {
        title: "Exploration for Round 2",
        content: `I explored a number of variations in high fidelity — here are a few.

Exploration 1: This was an early quick exploration in which I experimented with a tabbed interface that didn't quite work.

The following descriptions start with the screens below from the left.

1. Sharing modal sheet will be accessed from the glyph in the top right corner of the calendar
2. Modal sheet with sharing UI
3. Recipient name filled
4. QR code presented for recipient
5. Calendar subscription UI in settings with a switch to show state

Exploration 2: In this set I explored a flow from Profile/settings instead of the calendar because some stakeholders felt that was more appropriate. Design validation later guided us to provide a flow from both the calendar and settings.

The following descriptions start with the screens below from the left.

1. Sharing UI from Profile/settings and Subscription is now named "Device - Add Events"
2. Slightly refined sharing UI
3. A share button is presented when a recipient's name is filled
4. QR code presented for recipient
5. Recipient name is added to list to manage calendar access

Exploration 3: In this set I explored a flow from both the Profile and the Calendar.

This is the flow from the Profile. Here I used the standard mobile OS share sheet along with the possibility of capturing the text string of the recipient used in the sharing method — "Mom". However, I was advised that this was not technically possible, which required an extra step. I added that in the final design. (see flow diagrams below)

The following descriptions start with the screens below from the left.

1. Sharing UI from Profile
2. Slightly refined sharing UI with an explicit share button to call standard OS share sheet
3. Standard OS share sheet
4. Standard OS messaging UI
5. Recipient name is added to list to manage calendar access
6. Subscription is part of app Settings and I explored "Device Sync" instead of "Subscribe"

This is the flow from the Calendar.

The following descriptions start with the screens below from the left.

1. Calendar view has a More button in the top right corner
2. The More button presents the action sheet
3. Standard OS share sheet to share calendar with others`
      },
      {
        title: "Round 2 - Finalized",
        content: `Since I wanted to avoid asking the user for calendar access for privacy reasons, the Head of Engineering also agreed this was a good goal to strive for. However, this came with a cost. For instance, the iOS engineer on the team advised me that it would require calendar access to display the state of calendar subscription (ON/OFF) when viewing the in-app settings. I thus designed the calendar subscription as a single action button rather than a stateful button. But this was a small cost to pay for privacy. I also took this opportunity to refresh and improve the Profile view.

Secondly, as I wanted to help users view and manage shared calendar access, there was a technical limitation in iOS which resulted in a flow where users had to provide an identifier first for whom they were sharing with, followed by the actual sharing process. This wasn't ideal but it was something I couldn't avoid. You will see this illustrated in the interaction flow below and the screen below on the left. Overall I felt all of this was a small cost to pay to help users manage shared calendar access.

Lastly, there was also the component of how the calendar data should be presented in the default calendar app. I added emojis to denote day or night shifts. Emoji are quite effective at quickly conveying information at a glance without the need of words. I created a spec doc to clarify the details for both Calendar app and Google Calendar app on iOS. I worked with an Android product designer to clarify any details on the Android side.`
      },
      {
        title: "Hand-off & Deliverables",
        content: `I uploaded the final mocks to Zeplin along with associated interaction flow and spec documents.

I used TestFlight to install engineering builds on my device so I could provide feedback to engineering as they were implementing my designs. I worked with the technical product manager and a QA engineer to iron out wrinkles and answer questions from the engineering team. I primarily used Sketch for design and prototyping.`
      },
      {
        title: "Opportunity to Learn & Teach",
        content: `Since this project coincided with the imminent release of iOS 13, I kept myself up-to-date on the changes to iOS. In addition, I took this opportunity to learn and use a new prototyping tool called Drama to build a prototype. It is a wonderful tool and I hope to use it more in the future. During design critiques I spent a portion of the time sharing what I learnt about iOS 13 and Drama with the rest of the design team.`
      },
      {
        title: "For the Future",
        content: `First, I want to talk about metrics. This being a new feature we are collecting usage metrics to establish a baseline. On-site design validation yielded positive results. I will be circling back with Customer Success to find out more. I will be monitoring App Store reviews and Twitter for feedback on the new feature and how I can improve.

I'd like to design and add a system for toasts across the entire app experience but also for this feature as there are parts of the flow that would benefit from a toast being displayed. Toasts provide confirmation to users when moderately heavy tasks have been completed. They also add the benefit for the user to discover and jump to different parts of the app based on specific workflows that would otherwise be undiscoverable because of the advanced or low priority nature of a feature or setting or preference.`
      },
      {
        title: "Challenges & Conclusion",
        content: `I have omitted some details so I could be concise and convey just enough of my story and journey. But to conclude, even though on-site design validation yielded positive results, there was still some friction with the extra step needed to manage access.

The design direction to provide additional protection for the user by using QR codes to share a calendar was challenging to get unanimous consensus from my partners and stakeholders. It was an interesting exploration and I hope to use it in the future when appropriate.

Given the minimal technical knowledge of our target audience, the right diction was also something I went back and forth on.

Lastly, my primary goal to maintain user data privacy along with the need to design a custom solution to manage calendar access was the most challenging part of the project.`
      }
    ]
  },
  {
    id: "humanics-swap-withdraw",
    title: "Humanics",
    subtitle: "Swap & Withdraw",
    description: "Humanics is a workforce management solution for nurses and nurse supervisors. The product has 2 parts: a desktop web app and a mobile app (iOS/Android).",
    category: "Product Design",
    thumbnail: "/images/projects/humanics-swap.png",
    year: "2019",
    month: "May",
    role: "Principal UI/UX Designer",
    skills: ["Feature Strategy", "UI", "UX", "Research"],
    results: "64% increase in swap feature usage",
    confidential: true,
    sections: [
      {
        title: "Role",
        content: `As the Principal UI/UX designer, my goal for this project was to improve the swap experience and design a new withdraw experience. I also made sure all iOS visual and interaction designs followed Apple's human interface guidelines.`
      },
      {
        title: "What is Swap & Withdraw?",
        content: `Nursing staff may need to swap one or more of their shifts with another staff member for various reasons but mostly personal ones. This is called initiating a shift swap. The customer success team and design research came to understand that staff were not discovering the swap button.

They also came across a second problem that nurses were facing… in some cases the recipient of a swap had not responded and the initiator wanted to withdraw the pending swap and initiate a new swap but they were unable to.`
      },
      {
        title: "Stakeholders & Partners",
        content: `The primary team consisted of the following folks:

– Head of Design
– Head of Engineering
– 1 Business Development Partner
– 1 Design Researcher
– 1 Nursing Domain Expert
– 1 Design Product Manager
– 1 Engineering Product Manager
– 1 iOS Engineer
– 1 Android engineer
– 1 Back-end Engineer
– 1 QA Engineer`
      },
      {
        title: "Previous Home for Swap",
        content: `As I mentioned above, nursing staff did not discover the swap button and my hypothesis was, it was undiscoverable because it was hidden below the fold.`
      },
      {
        title: "I Will Lift You Up",
        content: `I sketched out a few possibilities for where the swap button could go in relation to the primary details for a shift.

I then explored a few high fidelity concepts to improve discoverability without making the button overbearing or imposing.`
      },
      {
        title: "Other Locations",
        content: `I explored other locations in the app.

1. The one on the left (below) is the calendar card for the shift in the calendar view. This was a bit much as it felt like we were inviting staff to swap their shifts — swapping isn't really encouraged unless it is absolutely necessary.

2. The one on the right (below) is the Now screen. The Now screen is like an inbox of cards that have data that nurses may want to know about and act on. I explored a button on the card for an upcoming shift. Again, this was giving the action too much importance.`
      },
      {
        title: "New Home for Swap",
        content: `The best place for it is in the shift detail view in the header area. I decided to use the available space more efficiently in the header part of the view and moved some of the data around to find a new home for the button above the fold.`
      },
      {
        title: "Swap Pending",
        content: `The Withdraw action is basically the bookend action for a Swap. However, there is a state in-between — swap pending. When a swap is initiated a few things happen, it goes into a pending state while the initiator waits for the recipient to accept the swap request and a push notification is sent to the recipient. It also generates a swap pending card on the Now screen for the initiator and a swap request card on the Now screen of the recipient.`
      },
      {
        title: "Pending & Withdraw Exploration",
        content: `I explored a few different variations with the placement of the withdraw button. The amber colored glyph was being used on the calendar when a swap was pending. I decided to repeat that glyph in the shift detail view for continuity.`
      },
      {
        title: "Shift Detail and Swap Detail Views (Final UI)",
        content: `Since Withdraw is the bookend for Swap, it made sense for this button to take the place of Swap. I chose to place the pending glyph on the left of the button so I could morph the Swap button to pending. It may not work as well if I place it on the right.

The Withdraw button's location in the Shift Swap Request screen didn't require a lot of exploration and was fairly straightforward. I changed the title from "Your schedule preview" to "Proposed swap" so the placement of the button would make sense to the right of it, and less words are better when we localize in the future.`
      },
      {
        title: "Thinking About Notifications",
        content: `Some of the details that don't seem to be given much thought during the design process are notifications on the mobile platform. In my case… how many system level notifications should be pushed during the entire process of a shift swap transaction to the recipient and initiator?

Every app on a mobile platform is vying for the user's attention. When designing an app, one should be judicious about the number of notifications pushed to the user or there's a high risk of having your app be too noisy which can result in the user either deleting the app or turning of all notifications for your app. The former is obvious that you want to avoid, but the latter is also fairly detrimental to the success of an app.

In this scenario of initiating a swap and withdrawing it, the following cases were candidates I considered for push notifications:

– Should the initiator know that the swap was successfully sent and is pending acceptance?
– Should the recipient know that they received a swap request?
– Should the initiator know when a swap was accepted?
– Should the recipient know that a swap was withdrawn?

There is a fine line between providing too many or too few notifications — discovering that line is where the design opportunity lies.`
      },
      {
        title: "Hand-off & Deliverables",
        content: `I took this project as the opportunity to learn the entire shift swap workflow between the initiator, recipient, and supervisor. Based on my learnings I provided an updated interaction flow doc and uploaded the final mocks to Zeplin.

I used TestFlight to install engineering builds on my device so I could provide feedback to engineering as they were implementing my designs. I worked with the technical product manager and a QA engineer to iron out wrinkles and answer questions from the engineering team. I primarily used Sketch for design and prototyping.`
      },
      {
        title: "For the Future",
        content: `I want to talk about metrics. Shift swapping isn't a common or essential workflow so the metrics need to be analyzed accordingly. That being said, there was a 64% increase in usage of the swap feature. As always, I will be circling back with Customer Success to find out more. I will be watching App Store reviews and Twitter for feedback regarding this enhancement.

I talked about system push notification earlier; they were out of scope for this project so I saved my questions for later. I also wanted to focus on the motion design to provide some fun and delight. I worked with the Product Manager and Head of Design to add it to the product roadmap so I could tackle it across the entire app experience holistically at another time. I did the same with notifications, but I prioritized notifications over motion design.`
      },
      {
        title: "Challenges & Conclusion",
        content: `I have omitted a few details just to be concise and convey just enough of my story and journey. This project was not that complicated in itself but understanding the entire shift swap workflow was overwhelming but important. However, that learning helped me achieve the goals I had set for myself effectively in the given timeframe.

We are establishing a usage baseline for the withdraw option. This also is not part of a day-to-day workflow, so I am analyzing usage accordingly.`
      }
    ]
  },
  {
    id: "roblox-nux",
    title: "Roblox",
    subtitle: "NUX",
    description: "Roblox is a platform for entertainment content providers to publish their games, and a source for players to discover and play millions of games.",
    category: "Product Design",
    thumbnail: "/images/projects/roblox.png",
    year: "2018",
    month: "August",
    role: "Principal Designer",
    skills: ["Feature Strategy", "Roadmap", "UX", "IA", "Research"],
    confidential: true,
    sections: [
      {
        title: "Role & Context",
        content: `I am the Principal designer leading the design effort. The goals were derived from problems my design team and I identified from analyzing fall-off metrics (working with the analytics team), talking to parents and kids, dissecting the existing mobile NUX, feedback from Product Managers, and UX research.`
      },
      {
        title: "Stakeholders",
        content: `The team consists of VP of Product for Growth, Director of Design, Director of Analytics, Director of Engineering, Product Manager for Growth, 1 Sr. UX Researcher, 1 Front End Engineer, 1 Back End Engineer, and 1 Junior UX Designer.`
      },
      {
        title: "Why re-think NUX?",
        content: `The NUX as it stands today gets players to the Games page with the least number of steps. The hope is they'll play a game or more right after signing up, and then return the following day. However, I discovered that the games presented to a new player are not personalized and do not reflect categories that directly resonate with their interests. They are also not the ideal ones for the best mobile experience.

After consulting with my research, analytics, and design partners, I distilled my findings into several high-level issues with the original NUX design. It lacks aspects such as context, value proposition, reason, and misses conveying other fundamental aspects of Roblox, like the avatar and game play controls. The player journey itself feels very clinical, impersonal and possesses little to no emotional value. Focusing on the aforementioned aspects of NUX will not only improve immediate and long-term player retention but will also aid in aging up. These may not seem critical based on the app and analytics today, but are worth seriously re-considering.`
      },
      {
        title: "The Basics",
        content: `**Who:** The target audience today are kids in the 9-12 age range, but we are taking measures to age up (13-16 age group).

**High Level Goals:** To successfully redesign NUX for the short, mid, and long term, my recommendation is to (#1) focus design efforts related to aging up the experience and interface first, and (#2) improve retention. This aligns with higher level business goals.`
      },
      {
        title: "Breaking Down the Problem",
        content: `NUX is broken down to 3 phases so they can be tackled appropriately for optimal and strategic planning of the product roadmap.

Discovery and Acquisition: This phase covers how, when, where, and why do players find Roblox for the first time. It starts at the point of sources like YouTube, App Stores, Friends, etc. to the point of getting the app on the device.

Signup: This phase covers the experience from the point of launching the app (once it is on the device) to the point of completing the signup process.

D0 Cycle: In this phase, players go thru a cycle that starts with discovering their first game (right after signup), playing their first game, developing their identity, connecting with real life friends and/or online friends, and then repeating the cycle.`
      },
      {
        title: "The Evidence",
        content: `Design hypotheses are based on qualitative analysis of what exists today, quantitative analysis, metrics and feedback gathered from Director of Analytics and Sr. UX Researcher (UXR) and competitive analysis of other content platforms.`
      },
      {
        title: "The Low Hanging Fruit: Signup Flow",
        content: `Based on available resources and roadmap, my hypothesis is, rethinking the Signup phase first from the perspective of aging up will yield some immediate return on investment by getting players more connected to the product and will also improve retention metrics. I have intentionally omitted sensitive retention data related to fall-off.

When looking at the player fall-off from the point of launching the app to the point of players returning on Day 1 (D1), it might be tempting to just focus on improving the retention metrics. However, aging up is more important from a business standpoint at this time and since we are taking significant measures to address that, my suggestion was to start by refining the Signup phase for older and more discerning audience.

**Goals:** To age up, my recommendation is to focus design efforts on providing better context, value proposition, reason and gain a clear understanding of player interests while conveying other fundamental aspects of Roblox, like the avatar. Last but not least, the design should deliver a high EI.`
      },
      {
        title: "Purpose & Mission",
        content: `**Emotional Impact (EI):** The degree of emotional feeling and connection that humans have with a product experience is not easily quantifiable. My hypothesis is, it comprises of mental stimulation (based on engaging interaction design), visual stimulation (based on pleasing and delightful interface/motion design), and auditory stimulation (based on pleasurable sound design). Without the right amounts and combinations of these, a product experience will feel off, and humans will struggle to connect with and or stay loyal to a product. My hypothesis is, successful products generally deliver a high EI.

**Raise EI:** The player journey to the first game experience should deliver a high EI. Assumption is, this will improve the enjoyment and engagement value while also providing an experience that's personalized, meaningful, focused, safe and provide adequate value and knowledge of Roblox. Along with that, new players should be presented with the right games and provided with sufficient context, value and understanding along that journey, and reinforcement to get them playing the same day (D0) but also getting them to return another day (D1).`
      },
      {
        title: "North Star",
        content: `The glaring problem I've identified is lack of a personalized experience. My hypothesis is, by designing the entire ecosystem around the interests of players to deeply personalize the experience, we will not only raise the product's EI but we will also achieve our goals for NUX and improve long-term retention.

**Why Do Players Come:** My hypothesis is, the first reason most players come to Roblox is to play a wide variety of games with their friends (social ecosystem), but along with that, there is an element of their online presence, their digital identity and attributes surrounding that.

**What Do Players Want:** More importantly, my hypothesis around what they want is, content that relates to them, personalized and catered to their specific interests. My assumption is, understanding player interests and catering every aspect of their experience on the platform to their interests will be key to more aha moments, higher EI, and improved retention.`
      },
      {
        title: "Short Term Plan",
        content: `Challenge: The biggest one so far is how to maintain delicate balance by not upsetting metrics (too much), but also making just enough meaningful changes to the flow so we can achieve the defined goals without losing sight of the North Star.

Goal: High level goals for the short-term are to provide better context, value proposition, reason and gain a clear understanding of player interests.

Solution: With that goal in mind, I led my design team to create a set of modular screens (wireframes) that can be arranged in different sequences. The purpose of these screens are to convey key elements and information required for each screen. The final touches will be made by a visual designer on the team.

Risks: There is a possibility of increased fall-off when a signup flow has additional screens. However, my hypothesis is, breaking the single signup screen in the existing design to a total of 4 (only 3 added) will improve retention significantly in the long-term, and produce players who will remain loyal to the product because the extra screens will provide better context, reason, and value along with a more personalized experience in the long-term based on their interests.`
      },
      {
        title: "Welcome Screen",
        content: `This is the first screen new players will see as soon as the app launches. The design decisions for elements on this screen are, it needs to attract target audience in the older age group to satisfy our goals to age up. It should deliver a clear value proposition of Roblox as soon as the app launches because we want to retain and get players thru the sign up process successfully. It should be brief to prevent players from getting stuck here for too long.`
      },
      {
        title: "Birthday Screen",
        content: `Asking for birth date is a COPPA requirement because our core target audience are under 13. I decided to create a screen just for birthday because I wanted to have enough room to again convey the value proposition (info will be used to personalize content and suggest friends). When talking to kids and parents during interviews I understood that many were concerned about the privacy of this information so I wanted to also convey the fact that this info will be kept private and I wanted to take this opportunity to make the audience feel safe on our platform.`
      },
      {
        title: "Interests Screen",
        content: `As I noted before, my North Star goal is to have the entire ecosystem designed around player interests. That makes this screen the most important one of the redesign project. Using the birthday info, my plan is to show interests targeted for that particular age group. Metadata from interests will then affect design element on the following screens. For instance, the avatar itself will react to the chosen interests, the outfit also would change. If this screen comes after gender, the presented choices will be weighted differently. All in the name of personalizing around the players interests. The icons used here are placeholders.`
      },
      {
        title: "Gender Screen",
        content: `As I stated earlier, specific elements will change based on the order of these screens. If this screen comes after the player picks their interests, then the avatar and its outfit will reflect their choices. My hypothesis is, this will form a deeper connection with the player because it will feel more personalized. Along with that, I do not want to allow customization of the avatar during the signup process to avoid the possibility of players getting stuck in this step and not completing the signup process. The goal is to let players customize it soon after signup.`
      },
      {
        title: "Account Screen",
        content: `This is a straightforward screen, but again the repeating theme here is the avatar because I want to keep reminding the player of their digital identity in the Roblox world, which is a subtle but key element of the overall experience. A not so obvious problem players experience is finding a desirable username that's available. However, because most of our target audience today are under 13, we need to make sure they do not use their real name for privacy reasons.

The goal here is to suggest interesting usernames based on the choices they made on the interests screen. Again, providing a personalized experience while also adding some delight. I've been thinking of ways to avoid having to remember a password because kids either use weak passwords or forget the ones they've created. This is something I have yet to solve.`
      },
      {
        title: "Testing",
        content: `The plan is to run multiple tests on a small percentage of players using different configurations to validate all the hypotheses and assumptions. The results should help guide us for a global rollout.`
      },
      {
        title: "Results",
        content: `I can't get into detailed metrics because of confidentiality, but initial tests with additional steps are showing some fall-off through those steps (validating our hypothesis), but metrics for the number of signups is showing some lift. This is promising.`
      },
      {
        title: "Conclusion",
        content: `My hypothesis is, if we can capture player interests as early as possible in the signup process, we can immediately start personalizing the player experience right in the signup phase. My assumption is, this will start forming a deep connection with the new player even before they complete the signup process and it will only grow stronger moving forward as we continue to provide an even more personalized experience in every aspect of the platform centered around their interests.`
      }
    ]
  },
  {
    id: "jarvis",
    title: "Jarvis",
    subtitle: "Connected Car App",
    description: "A 2017 design proof of concept for an iOS app to control and monitor a connected car.",
    category: "Product Design",
    layout: "content-first",
    thumbnail: "/images/projects/jarvis.png",
    year: "2017",
    month: "June",
    role: "Product Designer",
    skills: ["Product Strategy", "UI", "UX", "IA", "Prototype", "Research"],
    confidential: true,
    sections: [
      {
        blocks: [
          { type: 'image', src: "/images/projects/jarvis/jarvis-01-app-icon.png", alt: "iOS App Icon", maxWidth: 250, noLightbox: true },
          { type: 'text', content: `I named the app _Jarvis_ after Tony Stark's assistant, with the north star in mind that it should be a smart app with contextual awarenesses.`, centered: true, size: 'large' },
          { type: 'notice', content: `Note: Confidential content - Do not share`, color: 'red' }
        ]
      },
      {
        title: "Role & Context",
        content: `I was the primary designer and I defined, designed and created all aspects of the design. Starting with identifying the problems and defining the goals, to creating an interactive design prototype for testing. The goals were derived from problems based on my use cases and informal UX research I conducted interviewing friends and family with connected cars. Data and vehicle functions were gathered from my car.`
      },
      {
        title: "Stakeholders",
        content: `There was just 1 stakeholder – an engineer friend of mine whom I roped in because I wanted someone to objectively provide feedback. I led the endeavor and collaborated closely with them on a regular basis. This partnership proved to be particularly beneficial because they also helped surface potential technical challenges and API limitations for the short-term roadmap.`
      },
      {
        title: "The Ideal Assistant",
        blocks: [
          { type: 'text', content: `**Why:** (High Level Problems) iOS apps of connected cars (like Tesla, BMW, Chevrolet, etc.) don't seem to be optimized for basic everyday use cases. They don't seem to utilize contextual data for a deeper and richer human experience. They seem to lack a focused human experience and have failed to delight me.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-02-manufacturer-app.jpg", alt: "Manufacturer's 2017 App Interface", maxWidth: 300 },
          { type: 'text', content: `**Goals:** At the high level I wanted to design a delightful and competent assistant with the following abilities.

1. Provide an improved experience for core functions to cater to everyday use (Hypothesis: mirrors expectations of target audience)

2. Communicate important information, states and warnings (with the help of contextual data and based on the hypothesis that target audience expect this)

3. Be a pleasant alternative to carrying the car's key fob (Assumption: Most common use case for a key fob is to lock, unlock and start a car. Majority of humans who own a connected car generally have their smart phone with them at all times. Thus, leaving the key fob at home and just using the smart phone is more convenient)

4. Unified experience for different brands (Assumption: Household of 2 adults sharing cars from different brands and using a single app experience to control those cars is preferred over 2 different app experiences)

5. Execute all of the above by making sure the experience and interface is elegant, organized, focused, intuitive, delightful, and simple.

**Who:** Target audience are humans who can drive a car and can operate a smart phone at the basic level.` }
        ]
      },
      {
        title: "Everyday Use",
        blocks: [
          { type: 'text', content: `I wanted to first tackle the problem (and goal #1) of basic and common actions for everyday use – unlocking and starting a connected car (Assumption: these actions are most common for everyday use when not carrying the key fob)

**Research:** My informal UX research based on friends and family validated my assumption that these actions are most common for everyday use, and feedback regarding the app experience was lukewarm.

**Analysis:** The current app provides access to basic actions for everyday use with a row of circular buttons.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-03-basic-actions.jpg", alt: "Basic Actions for Everyday Use", maxWidth: 450 },
          { type: 'text', content: `**Why:** (Problem) These buttons require higher accuracy to tap (Assumption: a swipe is better in this scenario) and the design does not seem to be optimized for everyday use (Hypothesis: tapping at this location on the screen isn't ideal for repeated use and the best human experience).

**Goal #1:** Provide an improved experience for these common functions to cater to everyday use.

**Solution:** I have always thought the slide to unlock control of the original iPhone's lock screen was such an elegant, thoughtful, and delightful design. My assumption is, the interface and experience was designed such that you would not accidentally unlock your device, the swipe gesture is very comfortable to execute for repeated everyday use instead of a more accurate tap gesture, and it is visually prominent.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-04-iphone-lockscreen.jpg", alt: "Original iPhone Lock Screen", maxWidth: 200 }
        ]
      },
      {
        title: "Overview Screen",
        blocks: [
          { type: 'text', content: `I thus took inspiration from iPhone's unlock control and decided to use it as the method to unlock or start the car. My hypothesis is, a swipe gesture at the bottom edge of the device is more ergonomic, requires less accuracy, less likely to be accidentally triggered, and satisfies goal #3.

My next hypothesis is, if the target audience forget to close any part of the vehicle (glass roof, windows, doors, etc.) they'd want to clearly see that state in the app. Assuming that information can be conveyed to the app, it should be surfaced adequately in the overview screen of the vehicle. Based on that hypothesis I decided to highlight that accordingly when that state occurs. This satisfies goal #2.

I chose to show the top view of the car in this screen because it provides the most optimal view to highlight different parts of the vehicle for the purposes of the overview screen. Regarding goal #4, if more than 1 car has been authenticated for access, there would be a visual control to switch vehicles from the title section (My Car) at the top. I have not visualized that yet, as I prioritized this goal lower on the list.` },
          { type: 'images', items: [
            { src: "/images/projects/jarvis/jarvis-05-overview-locked.jpg", alt: "Overview Screen - Locked" },
            { src: "/images/projects/jarvis/jarvis-06-overview-alert.jpg", alt: "Overview Screen - Alert" }
          ], maxWidth: 800 },
          { type: 'text', content: `Challenges: I prefer to adhere to established design patterns (standard bottom tabs in iOS apps) and only introduce something new when there is a clear win, aha moment or when absolutely necessary. In this case, the design decision to use the bottom part of the screen for swipe gestures was ideal for that action, which directed me to find a new home for the primary navigation.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-07-bottom-tabs.jpg", alt: "Standard Bottom Tabs in iOS App", maxWidth: 362 },
          { type: 'text', content: `Outcome: I took this opportunity to also satisfy goal #2 – to communicate important information, states and warnings. I thus introduced a new vertically stacked navigation control to also convey additional data.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-08-vertical-nav.jpg", alt: "Vertical Navigation Control", maxWidth: 500 }
        ]
      },
      {
        title: "Simplicity in Shades of Gray",
        blocks: [
          { type: 'text', content: `I initially explored a white and blue color palette for the interface, but I finally settled on shades of gray with clean lines because my design philosophy was to maintain simplicity and minimalism (inspired by Dieter Rams) and to convey a neutral but mature message to my audience. I chose to use basic colors to convey different meanings so I could use them in strong contrast against the gray interface and draw attention to key data points and design elements.` },
          { type: 'images', items: [
            { src: "/images/projects/jarvis/jarvis-09-gray-1.png", alt: "Gray Palette - Screen 1" },
            { src: "/images/projects/jarvis/jarvis-10-gray-2.png", alt: "Gray Palette - Screen 2" },
            { src: "/images/projects/jarvis/jarvis-11-gray-3.png", alt: "Gray Palette - Screen 3" },
            { src: "/images/projects/jarvis/jarvis-12-gray-4.png", alt: "Gray Palette - Screen 4" },
            { src: "/images/projects/jarvis/jarvis-13-gray-5.png", alt: "Gray Palette - Screen 5" }
          ], maxWidth: 800 }
        ]
      },
      {
        title: "Testing & Prototypes",
        blocks: [
          { type: 'text', content: `The additional screens shown below do not have any noteworthy rethinking, but I wanted to exhibit them for further conversation.` },
          { type: 'image', src: "/images/projects/jarvis/jarvis-14-additional.jpg", alt: "Additional Screens", maxWidth: 500 },
          { type: 'images', items: [
            { src: "/images/projects/jarvis/jarvis-15-prototype-1.jpg", alt: "Prototype Screen 1" },
            { src: "/images/projects/jarvis/jarvis-16-prototype-2.jpg", alt: "Prototype Screen 2" }
          ], maxWidth: 800 },
          { type: 'images', items: [
            { src: "/images/projects/jarvis/jarvis-17-prototype-3.jpg", alt: "Prototype Screen 3" },
            { src: "/images/projects/jarvis/jarvis-18-prototype-4.jpg", alt: "Prototype Screen 4" }
          ], maxWidth: 800 },
          { type: 'text', content: `Using these designs I built a design prototype for friends and family to validate my hypotheses and assumptions.` },
          { type: 'video', src: "/videos/jarvis-prototype.mp4", caption: "Preview of Design Prototype", maxWidth: 360 },
          { type: 'text', content: `Production: I have not built an engineering product yet.

Analytics & Metrics: When I have a working product, my plan is to collect anonymous usage data from the app, reviews from the App Store, feedback from Twitter, and refine the design accordingly.` }
        ]
      },
      {
        title: "Assistant of the Future",
        content: `To conclude, my high level goal was to make this app a delightful and competent assistant. To satisfy that goal, the assistant needs to react to contextual data with a broader scope. What got me thinking was the fact that my car has access to my calendar events (after granting permission). These calendar events have metadata associated with it such as location and people. The assistant could use this data (after I've granted permission) and act on it. The below ideas are high level concepts that need to be explored, tested, and validated.

Idea #1 - Reminder to Charge: Say the driver needs to be at a particular location the next day (based on the calendar event), assumption is this data can be used in accordance with available range (remaining battery charge) and currently parked location (at home for instance) to remind the driver to charge the battery for tomorrow's travel. Hypothesis is, this will bring that delight factor when you have a thoughtful assistant reminding you by your side.

Idea #2 - Comfortable Cabin: Say the driver is ready to head to the car for their drive home from work. Assumption is, when they start walking, previous map path data (to/from work), time of day, and motion data, from a smart phone can be used to turn on the HVAC system (automatically or after a push request) in the car and make the cabin temperature comfortable for when the driver gets to the car. Assumption is, this will be more accurate and can react to varying habits because a smart phone is with the human as opposed to the car setting with basic cabin preconditioning.`
      }
    ]
  },
  {
    id: "xcode-touch-bar",
    title: "Apple Xcode",
    subtitle: "Touch Bar",
    description: "Xcode is an integrated development environment (IDE) that's used by millions of developers around the world to build apps that consumers enjoy using on all Apple products.",
    category: "Product Design",
    layout: "content-first",
    thumbnail: "/images/projects/xcode.png",
    year: "2016",
    month: "August",
    role: "Lead Designer",
    skills: ["Product Strategy", "UI", "UX", "IA", "Research"],
    confidential: true,
    sections: [
      {
        blocks: [
          { type: 'image', src: "/images/projects/xcode/app-icon.jpg", alt: "macOS App Icon", maxWidth: 350, noLightbox: true },
          { type: 'text', content: `Apple introduced a touchscreen on the MacBook Pro laptops called the Touch Bar which displays dynamic functions based on the app being used.`, centered: true, size: 'large' },
          { type: 'notice', content: `Note: Confidential content - Do not share`, color: 'red' }
        ]
      },
      {
        title: "Role",
        content: `I was the lead designer for most of Xcode and saw it through almost 5 public releases. I partly worked on version 9, which was released at the end of 2017. The first Touch Bar experience for Xcode was publicly released at the end of 2016 with version 8. As the lead designer I led the design efforts for Xcode's Touch Bar all the way from defining the opportunities and goals, through to delivering final artwork to engineering for implementation and working with QA up until final release.

I interacted with 3 other designers on a regular basis who were working on other parts of Xcode so I could communicate the purpose, mission, and direction to maintain design consistency and coherence for the entire product experience. I worked with 2 engineers who implemented the design.`
      },
      {
        title: "Stakeholders",
        content: `The team consisted of an Org Director, Sr. Engineering Manager, Engineering Manager, Product Marketing Manager, Design Manager, 2 Engineers, 3 Sr. Designers, and QA Engineer.`
      },
      {
        title: "Exciting New Hardware",
        blocks: [
          { type: 'text', content: `The Touch Bar is a touchscreen on an Apple MacBook Pro and has the capability of providing actions that are global to an app and contextual to specific zones of an app based on cursor focus.` },
          { type: 'image', src: "/images/projects/xcode/touch-bar-interface.jpg", alt: "Xcode Touch Bar Interface" },
          { type: 'text', content: `**Context:** A developer's workflow takes them thru a variety of focal points in Xcode. Every focal point has actions with associated keyboard shortcuts that improves efficiency. Xcode has a lot of useful functionality with undiscovered keyboard shortcuts.` },
          { type: 'image', src: "/images/projects/xcode/main-window.jpg", alt: "Xcode App Main Window" },
          { type: 'text', content: `**Opportunity:** It was exciting to sort thru the noise and define the experiences and interfaces that could be designed for this new hardware. When I began, the high level question was, what will make the Touch Bar experience compelling enough to use in Xcode and bring value to the target audience when they purchase the new hardware?

**Analysis:** of trace data (anonymous app usage data) proved that many keyboard shortcuts for common functions were not being utilized to their full potential, which would improve efficiency for everyday use. Hypothesis was, most developers prefer using the keyboard as much as possible to be efficient (and they hardly use the mouse cursor) but they were not aware of the many keyboard shortcuts, or probably couldn't remember all of them. This was the value proposition and the biggest opportunity.

**Goals:** At the high level I wanted to design a human experience for the Touch Bar that would boost efficiency for the target audience. It shouldn't be too complicated but minimal and simple (Apple design philosophy) even though the target audience are capable of understanding complex systems.

The hypothesis was, loading up the Touch Bar with as many button as possible would increase cognitive load. Along with that, the recommendation from Apple's industrial design team was, be as judicious as possible with the number of buttons displayed in the Touch Bar and don't fill it even if there was room to do so.

Based on that, I defined the following goals.

1. Provide a dynamic touch interface for commonly used functions and flows of the main app. Hypothesis was, this would provide the most value by increasing efficiency for common tasks and workflows for the majority of our target audience.

2. Preferably only single step commands. Hypothesis was, commands with multiple steps do not provide the best human experience in the Touch Bar because of the limited size of the screen. The Touch Bar was designed to execute single actions.

3. Introduce target audience to undiscovered useful functions (Based on analysis of trace data)

**Who:** Target audience are all developers using Xcode. Assumption is, they are very technical, value efficiency the most, understand complex systems, and prefer high density over sparseness.` }
        ]
      },
      {
        title: "Xcode and New Hardware",
        blocks: [
          { type: 'text', content: `I led the design of the Touch Bar experience for about 6 contexts of Xcode.` },
          { type: 'image', src: "/images/projects/xcode/6-contexts.jpg", alt: "6 Contexts of Xcode" },
          { type: 'text', content: `**Information Architecture:** UX research helped me identify the common workflows and actions for the above contexts and parts. I created a mind map of the various functions I wanted to surface in the Touch Bar.` },
          { type: 'image', src: "/images/projects/xcode/mind-map.jpg", alt: "Mind Map" },
          { type: 'text', content: `**Challenges:** Once I had the list of useful functions I wanted to surface, I still had to be very judicious because I couldn't surface all of them. Most Touch Bar experiences for other apps are not designed to change when focus changes to different parts of the app.

Xcode being a complex tool and given the target audience, I had to decide which core functions are most important and should stick around when focus changes in the main window. Touch Bar solutions for most apps mirror visible buttons in the main window. These are functions that a user commonly interacts with using the mouse cursor.

Assumption is, humans would be reluctant to use a control in the Touch Bar that does not have a counterpart in the main window because they would not know what it is for. Given the target audience, I wanted to take the risk and surface a few functions that did not have visible counterparts in the main window if it would bring efficiency to common everyday workflows. My assumption was, this technical audience would be more comfortable with this direction than the consumer audience.

Then there was the question of adequate visual feedback for these buttons that don't have counterparts in the main window. Yes, the main window will react to the executed actions, but my hypothesis was that it wouldn't be sufficient. I had an idea that we didn't have time to implement for launch but I am unable to share the solution for confidentiality reasons.

Lastly, in some cases I had to infer and define my own layout and style guide because the Touch Bar system itself was being defined in parallel (by a different team).` }
        ]
      },
      {
        title: "Results",
        blocks: [
          { type: 'text', content: `**Toolbar and Navigator:** Based on design principles of a macOS app, the buttons in the toolbar are for global actions, and do not change when focus shifts to different parts of the app window – Xcode adheres to this principle. Based on UX research and feedback from target audience, I started the design process focusing on the human experience when using the source editor because a significant amount of time during development is spent in the source editor.

I started designing the Touch Bar experience holistically by asking the question, what is the combination of most essential Touch Bar functions for the toolbar along another section of the app? To write/edit code, the workflow technically begins in the navigator.

I needed to balance functions between the ones in the toolbar with ones from the navigator. Research and feedback guided me to the Play and Stop buttons, because those two buttons are used to run and stop apps most frequently during development and are the most common actions taken in the toolbar. I dedicated the rest of the space for contextual actions. In this case, the navigator. The navigator section can be broken down to 3 subsections – nav switcher at the top, list view under it, and filter bar at the bottom – all these have their own associated actions. I didn't consider the nav switcher for the Touch Bar because switching navigators is not a frequent action during development for everyday use.` },
          { type: 'image', src: "/images/projects/xcode/window-toolbar-navigator.jpg", alt: "Xcode App Main Window Toolbar and Navigator" },
          { type: 'text', content: `However, I explored actions specific to a selected file, actions under the plus button in the bottom left corner of the navigator and filter bar functions. This exploration didn't yield optimal results because my hypothesis was, these were not truly the most common actions, in some cases there were commands that required an extra tap to get to the final action, and the Touch Bar started to look cluttered in some cases.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-exploration-toolbar.jpg", alt: "Touch Bar Interface Exploration for Toolbar and Navigator" },
          { type: 'text', content: `I then explored more possibilities around just the filter bar area at the bottom; such as actions for the plus button and experiences using the filter field in the Touch Bar. These explorations also didn't yield optimal results because of the extra tap needed, and my hypothesis for the filter field being in the Touch Bar was, it could be potentially confusing to have an input field in the Touch Bar. This was not the intended use of the Touch Bar and it felt unnatural.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-exploration-filter-field.jpg", alt: "Touch Bar Interface Exploration with Filter Field" },
          { type: 'text', content: `After exploring the above possibilities, and based on more UX research, user feedback, and my top goals (particularly #2), I decided to keep it simple and go with just the filter toggles because I also wanted a consistent experience across all navigators. Developers are regularly filtering content in all navigators in the course of a day or during the development cycle.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-toolbar-navigator.jpg", alt: "Final Touch Bar Interface for Toolbar and Navigator" },
          { type: 'text', content: `**Editor/Canvas Bar:** Another designer defined the set of controls for the source editor itself, but I was responsible for the controls in the top bar of the editor/canvas. The icon in the left corner was not used frequently used during a typical day of development. The file path is actually a shortcut for quick navigation, but it won't fit in the Touch Bar and needs too many clicks to accomplish a task.

The control on the right end is used to navigate thru warnings in the code, but again, not something used everyday. However, the previous/next buttons on the left are used to quickly jump between files, which is a common action for everyday use. Based on all the features I considered for this top bar (see Mind Map above), I only decided on the previous/next navigation controls based the above reasons, UX research, feedback, and available space.` },
          { type: 'image', src: "/images/projects/xcode/window-top-bar-editor.jpg", alt: "Xcode App Main Window Top Bar and Editor/Canvas" },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-editor-top-bar.jpg", alt: "Final Touch Bar Interface for Editor/Canvas Top Bar" },
          { type: 'text', content: `**Interface Builder (IB) Canvas:** IB is the editor/canvas used to arrange the different visual elements of an app. Based on all the features I considered for the bottom bar of this canvas (see Mind Map above), I only decided on controls to update frames, and zoom controls, based on UX research, feedback from target audience, and available space.` },
          { type: 'image', src: "/images/projects/xcode/window-ib-canvas.jpg", alt: "Xcode App Main Window IB Canvas" },
          { type: 'text', content: `Trace data proved that these shortcuts were underutilized but worth surfacing for discovery based on common workflows in IB. As this is a canvas to layout the interface of an app, developers are constantly wanting to either see the layout at 1:1 pixel ratio (100%) to get an idea of the final result or are wanting to see everything on the canvas (=), which is 'fit to canvas'.

Even though the Update Frames button is on the right end in the main window, which was placed there for visual balance and prominence, the order of arrangement in the Touch Bar is based on the order of how often these actions will be used. Update Frames is an action that's most commonly used when working in IB and so I made it the first button in the group.

An interesting point to note in this design was that the final set of actions in the Touch Bar ended up influencing a change in the actions for the IB canvas to mirror the types of actions in the Touch Bar. In this case, the 2nd and 3rd buttons are single action zoom controls unique to the Touch Bar and don't exactly match the ones in the main window because of goals #1 and #2.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-ib-canvas.jpg", alt: "Final Touch Bar Interface for IB Canvas" },
          { type: 'text', content: `**Debug Bar:** When a developer is running an app in Xcode during development, they will sometimes pause the app to debug an issue. This set of controls show up to aid them in that debugging workflow. In this case, all actions in the main window are equally important so I ended up with a Touch Bar full of buttons.` },
          { type: 'image', src: "/images/projects/xcode/window-debug-bar.jpg", alt: "Xcode App Main Window Debug Bar" },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-debug-bar.jpg", alt: "Final Touch Bar Interface for Debug Bar" },
          { type: 'text', content: `**View Debugger Canvas:** When a developer is running an app in Xcode during development, they will sometimes pause the app to debug a visual issue. They will use the view debugger canvas in this case. My mind map above shows all the functions I considered.` },
          { type: 'image', src: "/images/projects/xcode/window-view-debugger.jpg", alt: "Xcode App Main Window View Debugger" },
          { type: 'text', content: `During the process of view debugging, the canvas provides the ability to view the app in a 2D/3D space. The 3D view is useful when looking for a misplaced view and the 2D view is useful to quickly preview the final result of the app layout. These are common actions when view debugging. Other functions beneficial when view debugging are, spacing out the views in 3D to find that misplaced view or filtering out views to again find that misplaced view or inspect a specific view.

I thus decided on the View Spacer, 2D/3D and View Filter controls based on the above reasons, supporting UX research, feedback from target audience, and goals. However, in this case I couldn't satisfy goal #2 because of the limited space, but my hypothesis was, the Touch Bar would be more ergonomic to manipulate a slider control over having to use a mouse cursor to drag the handles in the main window.

I explored a wide variety of designs particularly for the View Filter control because there was a lot of assumptions and hypotheses associated with it and because this is a very critical control to filter the many views of an app to debug an issue when it comes to the visual elements of an app.

In these explorations below, there were strong arguments to keep previews in the Touch Bar, but my hypotheses were, the previews are of not much value because they'll end up being cropped, will be difficult to identify because of their size in the Touch Bar, and the number of views will be too many to display and the design will not scale given the large number of views in most apps.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-view-filter-exploration-previews.jpg", alt: "Touch Bar View Filter Exploration with Previews" },
          { type: 'text', content: `My final argument was that the previews are already in the main window, so they can be omitted from the Touch Bar, and I wanted to maintain simplicity in the Touch Bar. Based on that, below were my alternative proposals based on my hypotheses. I proposed to remove the previews and explored different options for the slider control.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-view-filter-exploration-no-previews-1.jpg", alt: "Touch Bar View Filter Exploration without Previews" },
          { type: 'text', content: `The final design was very simple and was consistent with other slider controls on macOS; particularly QuickTime Player's trim control. I decided to use blue to be consistent with the blue color in the slider of the main window, but to also differentiate it from the trim control in QuickTime, because this action is filtering, not trimming.` },
          { type: 'image', src: "/images/projects/xcode/touchbar-view-filter-exploration-no-previews-2.jpg", alt: "Touch Bar View Filter Exploration without Previews" },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-view-debugger.jpg", alt: "Final Touch Bar Interface for View Debugger" },
          { type: 'image', src: "/images/projects/xcode/touchbar-final-view-filter.jpg", alt: "Final Touch Bar Interface for View Filter" }
        ]
      },
      {
        title: "Iconography",
        blocks: [
          { type: 'text', content: `I also designed and delivered the entire family of Touch Bar glyphs for Xcode including the ones for the parts the other designers were responsible for.` },
          { type: 'image', src: "/images/projects/xcode/glyphs.jpg", alt: "Final Touch Bar Interface Glyphs" }
        ]
      },
      {
        title: "Conclusion",
        content: `While the above design decisions were based on a significant amount of UX research and feedback, I debated and lobbied for the final designs. There was also little to no precedent for most of these Touch Bar experience designs, which made selling them to stakeholders more challenging. My plan was to continue to monitor trace data for usage of all the functions in the Touch Bar because I wanted to validate my assumptions and hypotheses, and to refine and add functionality for future updates. Because the Touch Bar was a new method of interaction on a laptop, I decided to keep the design simple for version 1, but there's definitely more functionality and value that can be added down the road.`
      }
    ]
  }
];
