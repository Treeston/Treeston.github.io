document.addEventListener("DOMContentLoaded",function()
{
    document.getElementById('toolbox-settings').addEventListener("click", function() { ShowModal('modal-settings'); });
    document.getElementById('toolbox-copyurl').addEventListener("click", function() { alert('NYI'); });
    document.getElementById('toolbox-close').addEventListener("click", function() { document.location.hash = ''; ReloadFromHashData(); });
    document.getElementById('toolbox-export-ydk').addEventListener("click", function() { alert('NYI'); });
    document.getElementById('toolbox-export-text').addEventListener("click", function() { alert('NYI'); });
});
