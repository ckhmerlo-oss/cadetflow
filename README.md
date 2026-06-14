# CadetFlow

**A comprehensive Student Information System (SIS) designed specifically for military high schools, starting with disciplinary management.**

---

## What is CadetFlow?

CadetFlow is a digital platform that replaces paper-based disciplinary systems and manual record-keeping at military high schools. It automates the entire process of tracking demerits, calculating extra duty (tours), managing approval workflows, and maintaining student records—all while ensuring complete transparency for cadets and reducing administrative burden for faculty and staff.

Think of it as a **one-stop shop** for managing everything related to student conduct, academic records, leave requests, and school operations—all in one secure, web-based system.

---

## The Problem It Solves

**Before CadetFlow:**

- Faculty manually tabulated demerits and tours using spreadsheets or paper records
- Cadets had limited visibility into their disciplinary standing
- Approval processes required physical routing of paperwork through the chain of command
- Tour calculations were error-prone and time-consuming
- No centralized system for tracking student information across departments

**With CadetFlow:**

- Automated calculation of demerits, credits, and tours
- Real-time visibility for cadets into their own records
- Digital approval workflows that route reports automatically
- Reduced administrative workload for TAC officers and faculty
- Centralized student information accessible to authorized staff
- Complete audit trail for all disciplinary actions

---

## Key Features

### For Cadets

- **View Your Ledger:** See your current demerits, tour balance, conduct level, and remaining credits at any time
- **Track Progress:** Visual indicators show how close you are to the next conduct level
- **Submit Appeals:** Request review of completed reports through a structured process
- **Request Leave:** Submit leave requests that route through the approval chain

### For Cadet Leadership

- **Submit Reports:** File demerit reports on subordinate cadets
- **Approve Reports:** Review and approve reports at your level in the chain of command
- **View Subordinates:** Access ledgers for cadets under your supervision
- **Track Company Performance:** Monitor disciplinary trends within your company

### For Faculty & Staff

- **Submit Reports:** File reports on any cadet
- **View Green Sheet:** Daily summary of all approved, unposted reports
- **Tour Sheet:** See all cadets with outstanding tours
- **Roster Management:** View and manage student rosters by company, grade, or role
- **Coach/Band Pages:** Specialized views for coaches and band directors to track their athletes/members

### For TAC Officers

- **Full Roster Access:** View and manage all cadets in your company or across the school
- **Approve High-Level Reports:** Final approval authority for disciplinary actions
- **Manage Parent Links:** Connect parents to their cadet's records
- **Probation Tracking:** Monitor and manage cadets on probation
- **Generate Reports:** Export data for reporting and analysis

### For Administrators

- **Configure Policies:** Set tour credits per term, conduct level thresholds, and nuke rules (all admin-editable—no code changes needed)
- **Manage Infraction Catalog:** Add, edit, or deactivate offense types and their demerit values
- **Configure Approval Chains:** Set up the chain of command workflow for different report types. When editing chains, the system creates a new version so existing reports continue using their original chain definition.
- **Manage Academic Terms:** Set start and end dates for terms (triggers automatic credit resets)
- **Role Management:** Assign permissions and roles to users
- **Bulk Operations:** Import users via CSV or PowerSchool integration
- **System Settings:** Configure school-wide settings like timezone and notification preferences

### For Parents

- **View Your Cadet's Ledger:** Read-only access to your child's disciplinary record
- **Submit Leave Requests:** Create leave requests on behalf of your cadet
- **Update Contact Information:** Keep your contact details current
- **Receive Notifications:** Get alerts when your cadet reaches certain thresholds

---

## How It Works

### The Disciplinary Flow

1. **Report Submission:** A faculty member or cadet leader submits a demerit report (a "Stick") on a cadet
2. **Automatic Routing:** The system determines the correct approval chain based on the submitter's role and the cadet's company
3. **Chain of Command Review:** Reports move through the approval chain (e.g., Squad Leader → Platoon Sergeant → Company Commander → TAC → Commandant). **Multiple approvers at the same level** can approve reports, distributing the workload effectively. If an administrator edits an approval chain, existing reports stay on their original chain version to prevent mid-flight corruption.
4. **Finalization:** Once approved by the final authority, the report is completed. After completion, core fields (offense type, demerits, subject, date) cannot be changed—only posting status and internal notes can be updated.
5. **Automatic Calculation:** The system automatically:
   - Applies demerits to the cadet's record
   - Consumes tour credits first (typically 15 per term)
   - Converts excess demerits to tours (1 tour ≈ 30 minutes of extra duty)
   - Updates conduct levels based on term and year totals
   - Handles special cases (e.g., Category 3 infractions that "nuke" all credits)
6. **Green Sheet:** Completed reports appear on the daily Green Sheet (unless posted/unposted by authorized staff)
7. **Ledger Update:** The cadet's permanent record is updated with full audit trail

### Appeals Process

- Cadets can appeal completed reports
- Appeals route through the same chain of command with notes at each level
- If granted, demerits are zeroed or the report is voided (but never deleted—full audit trail preserved)
- **Special case:** If a Category 3 report (that nuked credits) is successfully appealed and voided, the system performs a full term recalculation: it recomputes the entire term's demerits, credits, and tours in chronological order, then inserts compensating adjustments to ensure all dependent tours are correctly calculated. Credits are restored to their pre-nuke state.

---

## Key Concepts

### Tour Credits

Every cadet starts each term with a buffer of tour credits (typically 15). Demerits consume credits first. Only when credits reach zero do demerits convert to tours. This gives cadets a "grace period" at the start of each term.

**Exception:** Category 3 infractions immediately set credits to zero and convert all following demerits to tours (demerits already received are not converted retroactively).

### Conduct Levels

Conduct is calculated separately for the **term** and the **year**, with the least commendable level taking precedence:

- **Exemplary:** 0-6 demerits (term) / 0-30 (year)
- **Commendable:** 7-18 demerits (term) / 31-90 (year)
- **Satisfactory:** 19-30 demerits (term) / 91-150 (year)
- **Deficient:** 31-42 demerits (term) / 151-210 (year)
- **Unsatisfactory:** 43+ demerits (term) / 211+ (year)

*Thresholds are configurable by administrators and can change as school policy evolves.*

### Chain of Command

Each report type (demerits, leave requests, work orders) can have its own approval chain. Chains are configurable per school and can branch by company or other organizational units. The system automatically routes reports to the correct approver at each step. **Multiple users** can be members of the same approval group (e.g., multiple Squad Leaders), enabling effective load distribution—any authorized approver at that level can act on the report. When administrators edit approval chains, the system creates a new chain version so existing reports continue using their original chain definition.

---

## Security & Privacy

- **Backend-First Security:** All permissions and access controls are enforced by the database and server—the user interface cannot grant unauthorized access
- **Role-Based Access:** Users only see and can only perform actions appropriate to their role
- **Field-Level Privacy:** Different types of notes have different visibility levels (e.g., general notes visible to cadets/parents, internal notes visible only to TAC/commandant, commandant notes visible only to commandant)
- **Complete Audit Trail:** Every action is logged with who did what and when (including when administrators impersonate other users)
- **Data Isolation:** Each school's data is completely isolated (multi-tenant ready)
- **No Hard Deletes:** Reports and records are never permanently deleted—only marked as voided or archived for complete historical accuracy. Configuration items (roles, companies, infractions, approval chains) are soft-deleted (archived) but never removed to preserve data integrity.

---

## Future Roadmap

CadetFlow V2 is being built as a comprehensive SIS platform. Planned features include:

- **Leave Request System:** Full workflow for cadet and parent leave requests
- **Work Orders:** Track facility maintenance and move-in/move-out documentation
- **PowerSchool Integration:** Automatic sync of roster and grade data
- **Staff Notes:** Digital file system for TAC notes on student profiles
- **Monthly Scorecards:** Auto-generated reports sent to TACs for comment, then to parents
- **Location Tracking:** Track student location during sports trips and leave
- **Enhanced Notifications:** Configurable alerts for thresholds, deadlines, and important events
- **Mobile Apps:** Native iOS and Android applications

---

## Who Uses CadetFlow?

- **Cadets:** View their own records and submit appeals
- **Cadet Leaders:** Submit reports and approve at their level
- **Faculty:** Submit reports and view disciplinary summaries
- **TAC Officers:** Manage company rosters and approve high-level reports
- **Coaches & Band Directors:** Track their athletes/members
- **Administrators:** Configure system settings and manage users
- **Parents:** View their cadet's ledger and submit leave requests

---

## Getting Started

For technical implementation details, see:
- **[Implementation Plan](Implementation.md)** — Detailed technical architecture and build phases
- **[V2 Specification](.cursor/plans/cadetflow_v2_specification_d63df2f3.plan.md)** — Complete design specification

For end users, training materials and user guides will be provided separately.

---



This system is designed to be intuitive and user-friendly. If you have questions about how to use CadetFlow or need support, contact your school's IT administrator or TAC officer.

---

*CadetFlow V2 — Built with security, transparency, and administrative efficiency in mind.*
