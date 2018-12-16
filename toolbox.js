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

document.addEventListener("DOMContentLoaded",function()
{
    document.getElementById('toolbox-settings').addEventListener("click", function() { ShowModal('modal-settings'); });
    document.getElementById('toolbox-copyurl').addEventListener("click", CopyURL);
    document.getElementById('toolbox-close').addEventListener("click", function() { document.location.hash = ''; ReloadFromHashData(); });
    document.getElementById('toolbox-export-ydk').addEventListener("click", function() { alert('NYI'); });
    document.getElementById('toolbox-export-text').addEventListener("click", function() { alert('NYI'); });
});
