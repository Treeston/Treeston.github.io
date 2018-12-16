function SaveAs(filename, content)
{
    var a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    var blob = new Blob([content], {type: 'text/plain'});
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(blob);
    document.body.removeChild(a);
}

function CopyURL()
{
    var btn = this;
    if (btn.currentlyDisabled)
        return;
    btn.currentlyDisabled = true;
    navigator.clipboard.writeText(document.location.href).then(function()
    {
        btn.firstElementChild.style.display = 'block';
        btn.firstElementChild.style.display = 
        window.setTimeout(function()
        {
            btn.firstElementChild.style.display = '';
            btn.currentlyDisabled = false;
        }, 2000);
    });
}

let getExportedFileName = function(ending)
{
    var title = document.deckTitle;
    if (!title)
        title = 'Exported Deck';
    if (!title.endsWith(ending))
        title += ending;
    return title;
};
let addYDKLines = function(lines, tag)
{
    var cards = SortDeckCards(document.getElementById(tag+'-deck-container'));
    for (var i=0; i<cards.length; ++i)
        lines.push(String(cards[i].cardId));
};
function ExportYDK()
{
    var lines = ['#created by Deck Viewer (' + document.location.host + ')','#main'];
    addYDKLines(lines, 'main');
    lines.push('#extra');
    addYDKLines(lines, 'extra');
    lines.push('!side');
    addYDKLines(lines, 'side');
    lines.push('');
    
    SaveAs(getExportedFileName('.ydk'), lines.join('\n'));
}

let addTextLine = function(lines, card, count)
{
    lines.push(count + 'x ' + card.name);
};
let addTextLines = function(lines, cards, label)
{
    if (!cards.length)
        return;
    lines.push('== ' + label + ' (' + cards.length + ((cards.length > 1) ? ' cards)' : ' card) =='));
    var lastData = null;
    var count = 0;
    for (var i=0; i<cards.length; ++i)
    {
        var card = cards[i][1];
        if (lastData)
        {
            if (card.name == lastData.name)
            {
                ++count;
                continue;
            }
            addTextLine(lines, lastData, count);
        }
        lastData = card;
        count = 1;
    }
    addTextLine(lines, lastData, count);
    lines.push('');
};
function ExportText()
{
    var overlay = document.getElementById('toolbox-export-text').firstElementChild;
    overlay.style.display = 'block';
    RequestAllCardData(function(data)
    {
        var lines = [];
        addTextLines(lines, data.main, 'Main Deck');
        addTextLines(lines, data.extra, 'Extra Deck');
        addTextLines(lines, data.side, 'Side Deck');
        
        SaveAs(getExportedFileName('.txt'), lines.join('\n'));
        
        overlay.style.display = '';
    });
}

document.addEventListener("DOMContentLoaded",function()
{
    document.getElementById('toolbox-settings').addEventListener("click", function() { ShowModal('modal-settings'); });
    document.getElementById('toolbox-copyurl').addEventListener("click", CopyURL);
    document.getElementById('toolbox-close').addEventListener("click", function() { document.location.hash = ''; ReloadFromHashData(); });
    document.getElementById('toolbox-export-ydk').addEventListener("click", ExportYDK);
    document.getElementById('toolbox-export-text').addEventListener("click", ExportText);
});
