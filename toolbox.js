document.addEventListener("DOMContentLoaded",function()
{
    document.getElementById('toolbox-settings').addEventListener("click", function() { ShowModal('modal-settings'); });
    document.getElementById('toolbox-main').addEventListener("mouseover", function()
    {
        if (!this.style.height)
            this.style.height = document.getElementById('toolbox-main-container').clientHeight + 'px';
        document.getElementById('toolbox-main-export').style.display = '';
    });
    document.getElementById('toolbox-export').addEventListener("click", function()
    {
        var parent = document.getElementById('toolbox-main');
        var sibling = document.getElementById('toolbox-main-container');
        var child = document.getElementById('toolbox-main-export');
        if (child.expanded)
        {
            child.expanded = false;
            parent.style.height = sibling.clientHeight + 'px';
        }
        else
        {
            child.expanded = true;
            parent.style.height = (sibling.clientHeight + child.clientHeight + 7) + 'px';
        }
    });
    document.getElementById('toolbox-close').addEventListener("click", function() { document.location.hash = ''; ReloadFromHashData(); });
});
