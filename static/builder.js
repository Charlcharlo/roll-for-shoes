$("#cancelButton").click(function() {
    const newChar = $(this).val();
    if(newChar == "true") {
        let id = window.location.pathname;
        id = id.slice(19);
        fetch("/characters/" + id, {
            method: 'DELETE',
            headers: {
              'Content-type': 'application/json',
            }
        });
    }
    window.location.href = "/my-characters";
});