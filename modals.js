let currentModal = null;
function ShowModal(id)
{
    var newModal;
    if (id)
        newModal = document.getElementById(id);
    
    if (currentModal)
        currentModal.style.display = 'none';
    if (newModal)
        newModal.style.display = 'block';
    document.getElementById('modal-background').style.display = newModal ? 'block' : 'none';
    currentModal = newModal;
}

document.addEventListener("DOMContentLoaded",function()
{
    document.getElementById('modal-background').addEventListener('click', function() { ShowModal(null); });
});
