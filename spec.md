# Specification

## Summary
**Goal:** Build PillPal, a pill reminder app where users can manage medications, track daily doses, and review adherence history.

**Planned changes:**
- Backend data model for medications with fields: name, dosage, frequency, scheduled times, start date, optional end date, and notes; full CRUD operations
- Backend data model for dose logs tracking each dose event (taken, skipped, missed) per medication; supports querying history by medication or across all medications
- Medication management UI with an "Add Medication" form, a list/card view of all medications, and edit/delete actions per card
- Daily schedule view listing today's doses in chronological order, with Taken/Skipped/Missed action buttons and visual status indicators for already-logged doses
- Dose history and adherence view showing past dose events grouped by medication or date, with an adherence percentage per medication
- Clean, calming visual theme using soft warm neutrals and gentle accent colors (avoiding blue/purple), card-based layout, consistent typography across all screens
- Custom pill logo icon displayed in the app header/navbar, loaded from static assets

**User-visible outcome:** Users can add and manage their medications, see all doses scheduled for today and mark them as taken/skipped/missed, and review their dose history with per-medication adherence summaries — all within a calm, readable health-focused interface.
