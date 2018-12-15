// API gracefully provided by ygoprodeck.com

// Rate limit is 20 requests per 1 second
// We send at most one request every 100ms to be safe
const REQUEST_THROTTLE = 100;

let _cardDataCache = {};
let _cardDataRequests = [];
let _cardDataCallbacks = {};
let _cardDataLastRequest = null;

function RequestCardData(id, callback, ctx)
{
    if (id in _cardDataCache)
    {
        if (_cardDataCache[id] !== null)
        {
            if (callback)
                callback.call(ctx, _cardDataCache[id]);
            return;
        }
    }
    if (!(id in _cardDataCallbacks))
    {
        _cardDataRequests.push(id);
        _cardDataCallbacks[id] = [];
    }
    
    if (callback)
        _cardDataCallbacks[id].push([callback,ctx]);
    
    _cardDataLastRequest = id;
}

function ProcessCardData()
{
    try {
        var data = JSON.parse(this.responseText)[0][0];
        if (!(/^\d+$/.test(data.id)))
            throw '';
        
        var id = parseInt(data.id);
        data.id = id;
        
        if (data.atk)
            data.atk = parseInt(data.atk);
        if (data.def)
            data.def = parseInt(data.def);
        
        if (data.level)
            data.level = parseInt(data.level);
        if (data.linkval)
            data.linkval = parseInt(data.linkval);
        if (data.scale)
            data.scale = parseInt(data.scale);
        
        _cardDataCache[id] = data;
        var callbacks = _cardDataCallbacks[id];
        for (var i=0; i<callbacks.length; ++i)
            callbacks[i][0].call(callbacks[i][1], data);
        delete _cardDataCallbacks[id];
    } catch (e) {
        console.error(e);
        CardDataFailed.call(this);
    }
}

function CardDataFailed()
{
    console.error("Failed", this);
}

window.setInterval(function()
{
    var id = null;
    if (_cardDataLastRequest)
    {
        id = _cardDataLastRequest;
        _cardDataLastRequest = null;
    }
    else
        while (!id)
        {
            if (!_cardDataRequests.length)
                return;
            id = _cardDataRequests.pop();
            if (id in _cardDataCache)
                id = null;
        }
    
    _cardDataCache[id] = null;
    
    var request = new XMLHttpRequest();
    request.addEventListener("load", ProcessCardData);
    request.addEventListener("error", CardDataFailed);
    request.open("GET", "https://db.ygoprodeck.com/api/v2/cardinfo.php?name=" + id, true);
    request.send();
    
}, REQUEST_THROTTLE);
