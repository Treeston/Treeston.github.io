function SetTitle(title)
{
    document.deckTitle = title;
    
    if (title)
        document.title = title + ' - Deck Viewer';
    else
        document.title = 'Deck Viewer';
}

function SortDeckCards(container)
{
    var l = []
    for (var i=0; i<container.children.length; ++i)
        l.push(container.children[i]);
    
    const sortStyle = 'as-is';
    switch(sortStyle)
    {
        case 'as-is':
            break;
    }
    return l;
}

const DECK_MARGIN_SIDE = (1.5/104)*100;
const STACKED_CARD_WIDTH = (2/104)*100;
const CARD_WIDTH = (10/104)*100;
const CARD_MARGIN_X = (0.1/104)*100;
const DECK_MARGIN_TOP_VH = 2.5;
const DECK_MARGIN_BOTTOM_VH = 1;
const CARD_HEIGHT_VH = 14;
const CARD_MARGIN_Y_VH = 0.1;
function UpdateDeckCardLayout(container)
{
    // all X units are already in %
    // Y units need to be converted to % (from vh) to work with narrow mode
    const DECK_HEIGHT_FACTOR = (container.id == 'main-deck-container') ? (1/.6) : (1/.18);
    const DECK_MARGIN_TOP = DECK_MARGIN_TOP_VH * DECK_HEIGHT_FACTOR;
    const DECK_MARGIN_BOTTOM = DECK_MARGIN_BOTTOM_VH * DECK_HEIGHT_FACTOR;
    const CARD_HEIGHT = CARD_HEIGHT_VH * DECK_HEIGHT_FACTOR;
    const CARD_MARGIN_Y = CARD_MARGIN_Y_VH * DECK_HEIGHT_FACTOR;
    
    var cardlist = SortDeckCards(container);
    var stackLTR = GetUserSettingBool('stackLTR'); // true for rightmost card in front of stack, false for leftmost card
    var stackDuplicates = GetUserSettingBool('stackDuplicates'); // true to stack subsequent identical cards
    
    var previousId = null;
    for (var factor = 1.0; factor > 0; factor *= 0.98)
    {
        var i;
        var x = DECK_MARGIN_SIDE - factor*(CARD_WIDTH + CARD_MARGIN_X);
        var y = DECK_MARGIN_TOP;
        for (i=0; i<cardlist.length; ++i)
        {
            var card = cardlist[i];
            card.style.zIndex = stackLTR ? (i+1) : (cardlist.length-i);
            
            var dx;
            if (!stackDuplicates || previousId != card.cardId)
                dx = CARD_WIDTH + CARD_MARGIN_X;
            else
                dx = STACKED_CARD_WIDTH;
            
            previousId = card.cardId;
            
            x += factor * dx;
            if (x + CARD_WIDTH > 100)
            {
                x = DECK_MARGIN_SIDE;
                y += CARD_HEIGHT + CARD_MARGIN_Y;
                previousId = null;
                if (y + CARD_HEIGHT > 100)
                    break;
            }
            card.style.left = x+'%';
            card.style.top  = y+'%';
        }
        if (!(i < cardlist.length))
            break;
    }
}

function UpdateAllDeckLayouts()
{
    UpdateDeckCardLayout(document.getElementById('main-deck-container'));
    UpdateDeckCardLayout(document.getElementById('extra-deck-container'));
    UpdateDeckCardLayout(document.getElementById('side-deck-container'));
}

function MakeDOMCard(id)
{
    var main = document.createElement('div');
    main.className = 'card';
    main.cardId = id;
    main.addEventListener("click", ZoomThisCard);
    
    var pic = document.createElement('img');
    if (GetUserSettingBool('highResCards'))
        pic.src = 'https://ygoprodeck.com/pics/' + id + '.jpg';
    else
        pic.src = 'https://ygoprodeck.com/pics_small/' + id + '.jpg';
    main.appendChild(pic);
    
    return main;
}

function LoadDeck(cards, tag)
{
    if (cards.length%9) // data format is 8 character id + 1 character multiplicity
        throw ('Invalid deck data for ' + tag + ' deck');
    if (!(/^\d*$/.test(cards)))
        throw ('Invalid characters in deck data for ' + tag + ' deck');
    
    var container = document.getElementById(tag+'-deck-container');
    while (container.lastChild)
        container.removeChild(container.lastChild);
    
    for (var i=0; i<cards.length; i+=9)
    {
        var id = parseInt(cards.substring(i,i+8));
        var count = parseInt(cards.substring(i+8,i+9));
        if (!count)
            throw ('Invalid zero-copy card in deck data for ' + tag + 'deck');
        
        for (var n=0;n<count;++n)
            container.appendChild(MakeDOMCard(id));
    }
    
    var label = document.getElementById(tag+'-deck-label');
    label.innerText = container.children.length + ')';
    
    UpdateDeckCardLayout(container);
}

function ReloadFromHashData()
{
    var tag = document.location.hash;
    if (tag.length <= 1)
    {
        document.body.className = 'import';
        return;
    }
    else
    {
        document.body.className = 'view';
    }
    
    try
    {
        var datas = tag.substring(1).split(':');
        if (!datas.length)
            throw ('Invalid data structure');
        
        if (datas.length > 1)
            SetTitle(decodeURIComponent(datas[1]));
        else
            SetTitle(null);
        
        var decks = datas[0].split(';')
        if (decks.length < 1 || decks.length > 3)
            throw ('Too few or too many decks (' + decks.length + ')');
        
        CloseZoomViewer();
        
        LoadDeck(decks[0], 'main');
        if (decks.length > 1)
            LoadDeck(decks[1], 'extra');
        else
            LoadDeck('', 'extra');
        
        if (decks.length > 2)
            LoadDeck(decks[2], 'side');
        else
            LoadDeck('', 'side');
        
    }
    catch (error)
    {
        console.error('ERROR: ' + error);
    }
}

function DoImportYDK()
{
    var lines = this.result.split(/[\r\n]+/)
    var main = '';
    var extra = '';
    var side = '';
    
    var deck = null;
    var lastId = null;
    var num;
    for (var i=0; i<lines.length; ++i)
    {
        var line = lines[i];
        if ((line === lastId) && (num < 9))
        {
            ++num;
            continue;
        }
        
        if (deck && lastId)
        {
            lastId = ('0000000' + lastId).slice(-8);
            if (deck === 'main')
                main += (lastId + num);
            else if (deck === 'extra')
                extra += (lastId + num);
            else if (deck === 'side')
                side += (lastId + num);
            lastId = null;
        }
        
        if (line === '#main')
            deck = 'main';
        else if (line === '#extra')
            deck = 'extra';
        else if (line === '!side')
            deck = 'side';
        else if (/^\d+$/.test(line))
        {
            lastId = line;
            num = 1;
        }
    }
    if (deck && lastId)
    {
        lastId = ('0000000' + lastId).slice(-8);
        if (deck === 'main')
            main += (lastId + num);
        else if (deck === 'extra')
            extra += (lastId + num);
        else if (deck === 'side')
            side += (lastId + num);
        lastId = null;
    }
    
    document.location.hash = '#' + main + ';' + extra + ';' + side + ':' + encodeURIComponent(this.fileName);
    ReloadFromHashData();
}

function ImportYDK()
{
    if (!this.files.length)
        return;
    
    var ydkFile = this.files[0];    
    var reader = new FileReader();
    reader.fileName = ydkFile.name;
    reader.addEventListener('load',DoImportYDK);
    reader.readAsText(this.files[0]);
    this.value = this.defaultValue;
}

document.addEventListener("DOMContentLoaded",function()
{
    ReloadFromHashData();
    
    document.getElementById('ydk').addEventListener('change', ImportYDK);
});
