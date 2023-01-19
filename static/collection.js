$(".deleteChar").on("click", function () {
    const id = $(this).val();
    fetch("/characters/" + id, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        }
    });
    $(this).closest(".charBlock").remove();
});

$("#newCharacter").click(function() {
    $(this).find("form").submit();
});

$(".linkBtn").on("click", function() {
    const link = $(this).find("a").prop("href");
    window.location.href = link;
})