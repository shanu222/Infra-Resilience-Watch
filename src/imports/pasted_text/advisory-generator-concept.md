You are building a production-ready DIGITAL INFRASTRUCTURE ADVISORY GENERATOR for the Infrastructure Advisory & Project Development Wing.

The system must have TWO separate interfaces:

1. ADMIN ADVISORY MANAGEMENT SYSTEM
2. USER ADVISORY PORTAL

The Admin creates and manages authoritative advisory content.

The User portal displays published advisories in a professional, easy-to-understand format.

IMPORTANT:
This must be a REAL WORKING APPLICATION.

No fake data.
No fake advisories.
No hardcoded demo results.
No broken buttons.
No placeholder functionality presented as working functionality.

Build the complete workflow end-to-end.


========================================================
1. SYSTEM CONCEPT
========================================================

The system should work like this:

ADMIN

Create Advisory
      ↓
Select Hazard
      ↓
Select Location
      ↓
Select Infrastructure / Audience
      ↓
Enter Current Situation
      ↓
Add Recommended Measures
      ↓
Add Images
      ↓
Add Supporting Information
      ↓
Generate Professional Advisory
      ↓
Preview
      ↓
Edit
      ↓
Save Draft
      ↓
Publish
      ↓
USER PORTAL

User opens portal
      ↓
Selects Hazard
      ↓
Selects Province / District / Location
      ↓
Sees relevant published advisories
      ↓
Opens advisory
      ↓
Reads / downloads / shares advisory


========================================================
2. TWO COMPLETELY SEPARATE EXPERIENCES
========================================================

ADMIN SIDE:

Professional internal management interface.

USER SIDE:

Simple public-facing advisory portal.

Do NOT expose admin controls to normal users.

Do NOT allow normal users to edit, delete, create or publish advisories.


========================================================
3. ADMIN DASHBOARD
========================================================

Create a professional Admin Dashboard.

Top summary cards:

TOTAL ADVISORIES
DRAFTS
PUBLISHED
SCHEDULED
ARCHIVED

Also show:

Recent Advisories

Recently Updated

Most Viewed

Advisories by Hazard

Advisories by Province


Keep dashboard concise.

Do not overload it with unnecessary analytics.


========================================================
4. ADMIN ADVISORY CREATION
========================================================

Create a prominent:

+ CREATE NEW ADVISORY

button.

When clicked, open a professional advisory creation workflow.


========================================================
5. BASIC ADVISORY INFORMATION
========================================================

Admin enters:

ADVISORY TITLE *

ADVISORY TYPE

Options:

- Infrastructure Advisory
- Construction Advisory
- Emergency Advisory
- Preventive Advisory
- Technical Advisory
- Public Safety Advisory

HAZARD *

Options:

- Flood
- Flash Flood
- Urban Flooding
- Earthquake
- GLOF
- Landslide
- Avalanche
- Cyclone
- Windstorm
- Heavy Rainfall
- Urban Fire
- Drought
- Extreme Heat
- Multi-Hazard
- Other

SEVERITY:

Normal
Advisory
High
Critical


========================================================
6. LOCATION SYSTEM
========================================================

The system must support ALL OF PAKISTAN.

Include:

Province / Region:

Punjab
Sindh
Khyber Pakhtunkhwa
Balochistan
Gilgit-Baltistan
Azad Jammu & Kashmir
Islamabad Capital Territory

Then:

DISTRICT

The district list must dynamically update according to the selected province/region.

Do NOT use fake district names.

Create a proper structured Pakistan administrative-location dataset.

Allow:

National
Province
District
Specific Location

Example:

Pakistan
→ Punjab
→ Muzaffargarh

or:

Pakistan
→ Gilgit-Baltistan
→ Ghizer


========================================================
7. CURRENT SITUATION
========================================================

Admin should be able to enter the current situation.

Fields:

CURRENT SITUATION

[ Rich text editor ]

Example:

Heavy rainfall has resulted in increased runoff and localized flooding in low-lying areas...

OBSERVED / REPORTED CONDITIONS

[ Rich text editor ]

AFFECTED INFRASTRUCTURE

Checkboxes:

□ Roads
□ Bridges
□ Buildings
□ Schools
□ Hospitals
□ Drainage
□ Water Supply
□ Power
□ Communication
□ Other


========================================================
8. WEATHER / CURRENT CONDITIONS
========================================================

The Admin should be able to add current conditions relevant to the advisory.

Do NOT force unnecessary numerical information.

Allow:

Weather Condition

Rainfall Condition

River / Water Condition

Ground Condition

Visibility

Other Relevant Condition

Each should be optional.

The admin only fills information that is relevant to the advisory.


========================================================
9. ADVISORY CONTENT ENGINE
========================================================

This is the CORE of the application.

The Admin provides structured information.

The system formats it into a professional advisory automatically.

Admin should be able to enter:

SITUATION

RISK

IMMEDIATE ACTIONS

SHORT-TERM MEASURES

MEDIUM-TERM MEASURES

LONG-TERM RESILIENCE MEASURES

DOs

DON'Ts

ENGINEERING RECOMMENDATIONS

PUBLIC / USER GUIDANCE

CONTACT / ESCALATION INFORMATION


The system automatically organizes these into the final advisory design.


========================================================
10. ADVISORY GENERATOR
========================================================

Create a professional advisory generation engine.

The engine should NOT invent facts.

IMPORTANT:

AI/automation must only transform and structure information provided by the Admin or approved content templates.

It must NOT fabricate:

- rainfall amounts
- casualties
- damage
- locations
- infrastructure failures
- government instructions
- technical measurements
- warnings
- dates
- statistics

If information is unavailable:

do not invent it.

Either omit the section or show:

"Not provided"

ONLY in the Admin editing interface.

The published advisory should preferably hide empty sections.


========================================================
11. PROFESSIONAL ADVISORY FORMAT
========================================================

Automatically generate an attractive advisory.

Structure:

------------------------------------------------

INFRASTRUCTURE ADVISORY

[HAZARD]

TITLE

LOCATION
DATE
SEVERITY

------------------------------------------------

CURRENT SITUATION

...

------------------------------------------------

KEY RISKS

...

------------------------------------------------

IMMEDIATE ACTIONS

1.
2.
3.
4.

------------------------------------------------

RECOMMENDED ENGINEERING MEASURES

1.
2.
3.
4.

------------------------------------------------

BUILD BACK BETTER / RESILIENCE MEASURES

1.
2.
3.

------------------------------------------------

DO

✓
✓
✓

DON'T

✕

✕

------------------------------------------------

INFRASTRUCTURE-SPECIFIC GUIDANCE

Roads
Bridges
Buildings
Drainage
etc.

Only show categories relevant to the advisory.

------------------------------------------------

KEY TAKEAWAY

...

------------------------------------------------

SOURCE / REFERENCE

...

------------------------------------------------


========================================================
12. ADVISORY VISUAL DESIGN
========================================================

The advisory must look like an official professional engineering publication.

Use:

Deep Navy
Engineering Blue
Cyan
Green
Amber
Red
White

Severity colors:

NORMAL → Blue

ADVISORY → Amber

HIGH → Orange

CRITICAL → Red


Use:

- professional header
- hazard icon
- location badge
- date
- severity indicator
- structured cards
- icons
- clear headings
- clean typography
- photo areas
- footer
- page number

Do NOT make it look like a generic blog post.


========================================================
13. ADMIN IMAGE MANAGEMENT
========================================================

Admin can upload images for each advisory.

Allow:

- Upload image
- Preview
- Delete
- Reorder
- Add caption
- Mark as cover image

Images must appear in the generated advisory.

Do not distort images.

Use proper aspect ratios.

Allow:

JPG
PNG
WEBP


========================================================
14. ADVISORY COVER IMAGE
========================================================

Admin can select:

COVER IMAGE

This appears prominently in the published advisory.

Example:

Flood advisory
→ actual flood infrastructure photograph

Earthquake advisory
→ actual earthquake damage photograph

GLOF advisory
→ actual GLOF / mountain infrastructure photograph

Do NOT automatically generate fake disaster images.

Admin-controlled images only.


========================================================
15. CONTENT LIBRARY
========================================================

Create an Admin Content Library.

Admin can maintain reusable:

Hazard guidance
Engineering measures
Do/Don't items
Infrastructure recommendations
Standard paragraphs
Reference material
Images

For example:

FLOOD

Reusable measures:

- Clear drainage corridors
- Protect outfalls
- Raise critical equipment
- Improve culvert capacity
- Provide flood barriers

Admin can reuse these in future advisories.


========================================================
16. ADVISORY TEMPLATES
========================================================

Create reusable templates.

Examples:

FLOOD TEMPLATE

EARTHQUAKE TEMPLATE

GLOF TEMPLATE

LANDSLIDE TEMPLATE

URBAN FIRE TEMPLATE

HEAVY RAINFALL TEMPLATE

MULTI-HAZARD TEMPLATE

Admin can select a template when creating an advisory.

The template should automatically populate the correct structure.

Admin can edit everything before publishing.


========================================================
17. DRAFT / PUBLISH SYSTEM
========================================================

Every advisory must have a status:

DRAFT
REVIEW
PUBLISHED
SCHEDULED
ARCHIVED

Workflow:

Draft
↓
Review
↓
Publish

Admin must explicitly publish an advisory.

A draft must NEVER appear on the user portal.


========================================================
18. EDITING PUBLISHED ADVISORIES
========================================================

Admin can:

Edit
Update
Unpublish
Archive

If an advisory is updated:

create/update:

VERSION

LAST UPDATED

Example:

Version 2.0
Updated: 18 August 2026


========================================================
19. EXPIRY SYSTEM
========================================================

Admin can optionally specify:

PUBLISH DATE

EXPIRY DATE

If an advisory expires:

automatically move it to:

ARCHIVED

unless Admin chooses otherwise.

Expired advisories should not appear as current advisories.


========================================================
20. USER HOME PAGE
========================================================

The public user portal should be extremely simple.

Header:

INFRASTRUCTURE ADVISORY PORTAL

Subtitle:

Current infrastructure resilience advisories for Pakistan.


Main search:

SELECT HAZARD

SELECT PROVINCE / REGION

SELECT DISTRICT


Button:

VIEW ADVISORIES


Also show:

LATEST ADVISORIES


========================================================
21. USER ADVISORY CARDS
========================================================

Each advisory card should show:

Hazard icon

Title

Location

Date

Severity

Short summary

Cover image

[ READ ADVISORY ]


Example:

🌊 FLOOD

Flood Resilience Advisory for Muzaffargarh

Muzaffargarh, Punjab

18 August 2026

HIGH


========================================================
22. USER ADVISORY PAGE
========================================================

When user opens an advisory:

Show:

Cover image

Hazard

Title

Location

Date

Severity

Current Situation

Key Risks

Immediate Actions

Engineering Measures

Resilience Measures

DOs

DON'Ts

Photographs

References

Last Updated


Buttons:

DOWNLOAD PDF

PRINT

SHARE


========================================================
23. SEARCH AND FILTER
========================================================

User can filter by:

Hazard

Province

District

Date

Severity

Infrastructure Type


Search by keyword.

Example:

User searches:

"Muzaffargarh flood"

Show relevant published advisories.


========================================================
24. CURRENT / ARCHIVED ADVISORIES
========================================================

Separate:

CURRENT ADVISORIES

ARCHIVED ADVISORIES

Do not mix old advisories with current guidance.

Current advisories should be visually prominent.


========================================================
25. USER DOES NOT NEED LOGIN
========================================================

The public advisory portal should NOT require login.

Anyone can view published advisories.

Only Admin requires authentication.


========================================================
26. ADMIN AUTHENTICATION
========================================================

Create secure Admin authentication.

Do NOT hardcode passwords in frontend code.

Use secure server-side authentication.

Admin credentials must be stored securely using environment variables / proper authentication.

Implement:

Login
Logout
Session management
Protected admin routes


========================================================
27. ADMIN SECURITY
========================================================

Protect all Admin APIs.

Normal users must NOT be able to:

Create advisory
Edit advisory
Delete advisory
Publish advisory
Upload admin content
Access admin APIs


Validate permissions on the server/API.

Do not rely only on hiding frontend buttons.


========================================================
28. ADVISORY PDF
========================================================

Admin and users should be able to generate/download a professional PDF.

PDF should contain:

Official header

Advisory title

Hazard

Location

Severity

Date

Situation

Risks

Recommendations

Images

Do / Don't

Engineering measures

References

Footer

Page numbers


Ensure:

NO overlapping text

NO clipped images

NO broken tables

NO empty pages

NO content crossing page boundaries

NO footer overlap

Use intelligent page breaks.


========================================================
29. PRINT VERSION
========================================================

Create a professional print layout.

It should be suitable for:

A4

Letter

Mobile print preview

Do not print:

navigation
admin buttons
search controls
website UI

Only print the advisory.


========================================================
30. SHARE
========================================================

User can share an advisory.

Generate a clean share link:

/advisories/[id]

The link must open the published advisory directly.

Do not expose admin functionality.


========================================================
31. RESPONSIVE DESIGN
========================================================

The application must work perfectly on:

320px
375px
390px
414px
768px
1024px
1280px
1440px
1920px

Mobile user portal should be extremely simple.

Admin desktop interface can use wider layouts.

No:

horizontal scrolling
overlapping cards
clipped buttons
tiny text
broken modals


========================================================
32. PROFESSIONAL VISUAL DESIGN
========================================================

Use premium infrastructure/government engineering design.

Visual language:

- glassmorphism
- subtle gradients
- professional cards
- 3D buttons
- soft shadows
- engineering blue
- navy
- cyan
- green
- amber
- red

Do not overuse effects.

Readability comes first.


========================================================
33. ADMIN ADVISORY LIST
========================================================

Admin should see:

TITLE
HAZARD
LOCATION
SEVERITY
STATUS
CREATED
UPDATED
VERSION

Actions:

VIEW
EDIT
DUPLICATE
PUBLISH
ARCHIVE
DELETE

Delete should require confirmation.

Do not allow accidental deletion.


========================================================
34. DUPLICATE ADVISORY
========================================================

Admin should be able to duplicate an existing advisory.

Example:

Existing:

Flood Advisory — Muzaffargarh

Admin clicks:

DUPLICATE

System creates:

Draft copy

Admin changes:

Location
Date
Situation
Recommendations

Then publishes the new advisory.

This will significantly speed up daily advisory production.


========================================================
35. DAILY ADMIN WORKFLOW
========================================================

Make daily advisory production extremely fast.

Admin should be able to:

1. Open dashboard

2. Click:
CREATE ADVISORY

3. Select:
FLOOD

4. Select:
PUNJAB → MUZAFFARGARH

5. Select:
FLOOD TEMPLATE

6. Add current situation

7. Select relevant recommendations

8. Upload real photographs

9. Preview

10. Edit

11. Publish

Target workflow:

LESS THAN 5 MINUTES for a routine advisory.


========================================================
36. REUSABLE ENGINEERING RECOMMENDATIONS
========================================================

Admin should have a recommendation library.

Example:

FLOOD

- Clear drainage corridors
- Remove blockage
- Protect outfalls
- Increase culvert capacity
- Raise critical equipment
- Provide detention/retention
- Improve site drainage

EARTHQUAKE

- Structural assessment
- Column strengthening
- Beam-column joint strengthening
- Masonry confinement
- Roof anchorage
- Non-structural component restraint

GLOF

- Protect bridge foundations
- Debris deflection
- Scour protection
- Improve drainage
- Maintain flow channels
- Protect critical crossings

These can be selected and inserted into an advisory.


========================================================
37. INTELLIGENT SECTION DISPLAY
========================================================

Do not display every possible section.

If the Admin selects:

Flood + Road

show relevant road/flood sections.

If:

Earthquake + Building

show building/seismic sections.

If:

GLOF + Bridge

show bridge/GLOF sections.

The advisory should automatically adapt its structure.


========================================================
38. NO FAKE CONTENT
========================================================

This is CRITICAL.

Remove all demo/sample advisories before production.

Do not display fake:

locations
damage
rainfall
statistics
photos
dates
official instructions

The application must start with an empty database.

Only content entered/published by the Admin appears to users.


========================================================
39. DATA ARCHITECTURE
========================================================

Use a proper database-backed architecture.

Core entities:

Admin
Advisory
Hazard
Location
Infrastructure Type
Template
Recommendation
Image
Reference

Advisory fields should include:

id
title
type
hazard
severity
province
district
location
infrastructureTypes
currentSituation
risks
immediateActions
shortTermMeasures
longTermMeasures
dos
donts
engineeringRecommendations
images
references
status
version
createdAt
updatedAt
publishedAt
expiryDate


========================================================
40. API / BACKEND
========================================================

Create proper APIs for:

Create advisory
Get advisories
Get published advisories
Get advisory by ID
Update advisory
Delete advisory
Publish advisory
Archive advisory
Duplicate advisory
Upload image
Manage templates
Manage recommendations
Manage locations


Public API:

ONLY return published/non-expired advisories.

Admin API:

Require authentication.


========================================================
41. PERFORMANCE
========================================================

Optimize:

Images
PDF generation
Advisory loading
Search
Filtering

Use lazy loading for images.

Do not load every image at once.


========================================================
42. SEO / PUBLIC SHARING
========================================================

Published advisory pages should have:

Proper title
Description
Open Graph metadata
Share preview

Example:

"Flood Resilience Advisory — Muzaffargarh | Infrastructure Advisory"


========================================================
43. FINAL QUALITY STANDARD
========================================================

This must look like a serious professional infrastructure advisory platform.

NOT:

a generic CMS

NOT:

a basic CRUD dashboard

NOT:

a blog

NOT:

a Figma prototype

It should feel like a professional:

DIGITAL INFRASTRUCTURE ADVISORY PLATFORM FOR PAKISTAN.


========================================================
44. FINAL TESTING
========================================================

After implementation:

Test Admin login.

Test creating advisory.

Test saving draft.

Test editing.

Test image upload.

Test template selection.

Test recommendation selection.

Test preview.

Test publishing.

Test user search.

Test province filter.

Test district filter.

Test hazard filter.

Test advisory opening.

Test PDF.

Test print.

Test sharing.

Test archive.

Test expiry.

Test duplicate.

Test delete.

Test mobile.

Test desktop.

Test permissions.

Test unauthorized API access.

Check browser console.

Fix ALL errors.

Do not simply report errors.

ACTUALLY FIX THEM.


========================================================
FINAL OBJECTIVE
========================================================

Build a complete two-sided system:

ADMIN
→ CREATE
→ EDIT
→ STRUCTURE
→ GENERATE
→ REVIEW
→ PUBLISH
→ UPDATE
→ ARCHIVE

USER
→ SELECT HAZARD
→ SELECT LOCATION
→ SEARCH
→ READ CURRENT ADVISORY
→ DOWNLOAD
→ PRINT
→ SHARE

The Admin remains the authoritative source of advisory content.

The system automatically converts the Admin's structured information into one of the most professional, consistent and readable infrastructure advisories possible.

The user should never see unfinished, draft, fake or irrelevant information.