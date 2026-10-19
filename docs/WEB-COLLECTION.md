# Collection dashboard

Open Collection in the sidebar. The dashboard reads the existing authenticated roster, official index and species catalog. It does not send game mutations or change saved settings. The existing backend serves this frontend update immediately; refresh the page to load it without restarting the game session.

Overview totals count owned families, missing families, families with a best copy rated 17+, and completed level-30 families. Tier progress follows Exotic, Rare, Common, Epic and Legendary. Click a tier card or use the tier filter. Additional owned families absent from the catalog remain visible as Unlisted rather than disappearing.

Search matches family, evolution and nickname text. Ownership, best-rating and completion filters combine. Sort by tier/name, rating or highest owned level. Pages contain 24 families, with an expandable list of every owned copy and its level, rating and individual ID. Equal ratings prefer higher level, then lower ID. The best copy's level and highest owned level are kept distinct.

Completion uses any level-30+ owned copy or a captured fourth evolution in the index. A released completed copy can therefore leave a family missing but historically complete. An unloaded index does not imply incomplete; its historical status is unconfirmed. Seen-only evolution flags do not prove completion. Signed-out state shows a sign-in prompt rather than account totals. The dashboard uses the latest loaded account snapshot; normal gameplay refreshes the roster between encounters. Filters survive these updates.

Validation: 118 automated checks pass across the browser project. Nine dashboard checks cover aggregation, completion across duplicate copies, released indexed families, unknown index status, combined filtering, sorting, uncataloged owned species, pagination, open copy lists and signed-out rendering. Actual desktop/mobile visual inspection remains unavailable: the computer-use native pipe could not connect and browser automation returned no available surfaces. No alternative browser-control mechanism was used. HTTP checks verify that the existing backend serves the new tab, scripts and responsive styles.
