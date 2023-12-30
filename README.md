# GristonBot
Üdvözöllek, ez itt a GristonBot nevezetű Discord botom! A bot elkészítésével az volt a célom, hogy ne kelljen több különböző botot használni a szervereken.

## Ideiglenes hangcsatorna készítés
Ezzel a bottal létre lehet hozni saját hangcsatornákat egy adott hangcsatornához kapcsolódva. Ezt az ideiglenes hangcsatornát a felhasználó szabadon konfigurálhatja a boton keresztül!

- Parancs: `/createtempvcenv [kategórianév] [csatornakészítőnév]` 

## Hangcsatorna másoló
Ezzel a bottal be lehet állítani előre létrehozott csatornákat arra, hogyha csatlakoznak arra a csatornára, akkor másolja azt le, és tegye át a felhasználót oda!

- Parancs: `/setvccloner <csatorna>` 
- Leállító parancs: `/stopvccloner <csatorna>`

## Ticket rendszer
Ezzel a bottal létre lehet hozni egy ticket rendszert, amin keresztül a szervertagok felvehetik a kapcsolatot a moderátorokkal.

- Parancs: `/createticketenv [kategórianév] [ticketnyitónév] [ticekttár] [ticketnyitócím] [ticketnyitóleírás] [ticketnyitógomb]`
- Módosító parancs: *HAMAROSAN*

## Értesítők
Ezzel a bottal be lehet állítani értesítés küldést a Twitch streamekről és YouTube videó feltöltésekről!

- Parancs: `/notify <platform> <azonosító> <csatorna> [tartalom] [időlimit]`
- Módosító: `/editnotifier twitch/youtube`

## Tétleneknek rang adás
Ezzel a bottal automatikusan adhatsz a tétlen felhasználóknak egy megadott rangot, amivel mások meg tudják őt említeni. Tökéletesen lehet használni csapattárskereséshez!

- Parancs: `/giveroletoidles <állapot: True/False>`
