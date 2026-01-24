# Video Name Verification Guide

## Purpose
This document helps verify that Google Drive video file names match the titles displayed in the LiveTV section.

## Video Mapping Table

| ID | Title in App | Google Drive ID | Expected Filename | Verification URL |
|----|-------------|-----------------|-------------------|------------------|
| 1 | Sustainable Development Goals: A Strategic Framework | 1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ | Sustainable Development Goals A Strategic Framework.mp4 | [Check](https://drive.google.com/file/d/1YOyDTaOeadAxkUyjZI8DbsZHX8OVFdqJ/view) |
| 2 | Delivering the SDGs Through Technology & Governance | 121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P | Delivering the SDGs Through Technology & Governance.mp4 | [Check](https://drive.google.com/file/d/121y0xbR6SEQSMZSIg0PVZA8Wn1DHzx7P/view) |
| 3 | Digital Ecosystem: Driver of Economic Growth | 1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ | Digital Ecosystem Driver of Economic Growth.mp4 | [Check](https://drive.google.com/file/d/1251b1AGfXIPIP_hGkk-mlnhr5s0TsnfJ/view) |
| 4 | Finance & Responsibility: Beyond Profit | 1SYOtz1TxW_iXmLd1PmVIMi6Ynqhj2Vh9 | Finance & Responsibility Beyond Profit.mp4 | [Check](https://drive.google.com/file/d/1SYOtz1TxW_iXmLd1PmVIMi6Ynqhj2Vh9/view) |
| 5 | Aligning Sustainability, Ethics & Governance | 1Gxx8aFxFXFkmUc5jM94EC4orJJE_WMw0 | Aligning Sustainability Ethics & Governance.mp4 | [Check](https://drive.google.com/file/d/1Gxx8aFxFXFkmUc5jM94EC4orJJE_WMw0/view) |
| 6 | AI & Sustainability: Technology for Change | 1ZdEmNMQpkBhRIzfMf_BCERdnTQJgyqa6 | AI & Sustainability Technology for Change.mp4 | [Check](https://drive.google.com/file/d/1ZdEmNMQpkBhRIzfMf_BCERdnTQJgyqa6/view) |
| 7 | From Waste to Worth: Circular Economy | 1_vqRWG1-m9-yqzQl-bLcxldQqUEJwUkh | From Waste to Worth Circular Economy.mp4 | [Check](https://drive.google.com/file/d/1_vqRWG1-m9-yqzQl-bLcxldQqUEJwUkh/view) |
| 8 | Financial Markets: Meaning Beyond Money | 1_ERDjEswCOTLWObPLA6T7cdgJK6IO-Hp | Financial Markets Meaning Beyond Money.mp4 | [Check](https://drive.google.com/file/d/1_ERDjEswCOTLWObPLA6T7cdgJK6IO-Hp/view) |
| 9 | Governance & Risk: Building Resilience | 15t9-nTlOgIMCyCBV-PzyxcnRAEa6nCCp | Governance & Risk Building Resilience.mp4 | [Check](https://drive.google.com/file/d/15t9-nTlOgIMCyCBV-PzyxcnRAEa6nCCp/view) |
| 10 | Opportunities in the New World Order | 1aqR59K66ZBXGn6yJAk1X6_SiVC6zOu_V | Opportunities in the New World Order.mp4 | [Check](https://drive.google.com/file/d/1aqR59K66ZBXGn6yJAk1X6_SiVC6zOu_V/view) |
| 11 | India's Digital Convergence & Financial Inclusion | 1nSNoRvalFMOjYnAPEAP5WkpneuEuqY2a | India's Digital Convergence & Financial Inclusion.mp4 | [Check](https://drive.google.com/file/d/1nSNoRvalFMOjYnAPEAP5WkpneuEuqY2a/view) |
| 12 | Global Markets vs India: Economic Eminence | 199MXOMc2WKPW1EoO7qg-2TFCMTR6qLC4 | Global Markets vs India Economic Eminence.mp4 | [Check](https://drive.google.com/file/d/199MXOMc2WKPW1EoO7qg-2TFCMTR6qLC4/view) |
| 13 | Technology, Governance & Measurable Impact | 19uh2THvg-NP7sq5yt4HwmHpTB5HJb7lZ | Technology Governance & Measurable Impact.mp4 | [Check](https://drive.google.com/file/d/19uh2THvg-NP7sq5yt4HwmHpTB5HJb7lZ/view) |
| 14 | Circular Economy: Sustainable Business Models | 1dxlSxij_Sy1crUUITUq6ujQyW4ug46Xa | Circular Economy Sustainable Business Models.mp4 | [Check](https://drive.google.com/file/d/1dxlSxij_Sy1crUUITUq6ujQyW4ug46Xa/view) |
| 15 | Climate Risk Management Strategies | 1P5qt6TBLcT-r9O-zt3-LQYtqWB0Hx6M4 | Climate Risk Management Strategies.mp4 | [Check](https://drive.google.com/file/d/1P5qt6TBLcT-r9O-zt3-LQYtqWB0Hx6M4/view) |
| 16 | Sustainable Leadership & Ethics | 1HwDAbDruhmVpBm-lTJck3_i2hFImoZ7e | Sustainable Leadership & Ethics.mp4 | [Check](https://drive.google.com/file/d/1HwDAbDruhmVpBm-lTJck3_i2hFImoZ7e/view) |

## Verification Steps

1. **Click each "Check" link** in the table above
2. **Verify** that the actual Google Drive filename matches the "Expected Filename" column
3. **If there's a mismatch:**
   - Option A: Rename the file in Google Drive to match the expected filename
   - Option B: Update the title in `src/LiveTV.tsx` to match the actual Google Drive filename

## Running the Test

To run the automated validation tests:

```bash
npm test src/__tests__/LiveTV.test.tsx
```

This will validate:
- All videos have required fields
- All video IDs are unique
- All titles are unique
- Video IDs are valid strings
- Google Drive URLs are properly formatted

## Notes

- Google Drive file IDs are permanent and won't change even if you rename the file
- The titles shown in the app can be different from the actual filenames in Google Drive
- For best practice, keep the app titles and Google Drive filenames synchronized
- Special characters (: - &) may be handled differently between the app and Google Drive
