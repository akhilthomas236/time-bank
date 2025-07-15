# SharePoint List Setup Instructions

## TimeEntries List
1. Name: TimeEntries
2. Columns:
   - UserId (Single line of text)
   - UserName (Single line of text)
   - ToolUsed (Single line of text)
   - TimeSaved (Number)
   - Description (Multiple lines of text)
   - DateLogged (Date and Time)
   - CreditsEarned (Number)
   - Multiplier (Number)

## UserCredits List
1. Name: UserCredits
2. Columns:
   - UserId (Single line of text)
   - UserName (Single line of text)
   - TotalCredits (Number)
   - LastUpdated (Date and Time)

## RedemptionHistory List
1. Name: RedemptionHistory
2. Columns:
   - UserId (Single line of text)
   - UserName (Single line of text)
   - Benefit (Single line of text)
   - CreditsSpent (Number)
   - DateRedeemed (Date and Time)
   - Status (Choice: Pending, Approved, Rejected, Completed)

## Benefits List
1. Name: Benefits
2. Columns:
   - Title (Single line of text)
   - Description (Multiple lines of text)
   - CreditsRequired (Number)
   - Category (Choice: Family, Wellness, Professional, Team)
   - IsActive (Yes/No)
