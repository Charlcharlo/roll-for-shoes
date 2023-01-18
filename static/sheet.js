let character
let id = window.location.pathname;
id = id.slice(7);

fetch('/characters/' + id)
  .then((response) => response.json())
  .then((data) => {
        character = data;
    });

function saveXp(xp) {
    character.xp = xp;
    fetch("/characters/" + character._id, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          "xp": xp,
        })
    });
};

function saveSkills() {
    fetch("/characters/" + character._id, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          skills: character.skills
        })
    });
}

$("#xpUp").on("click", function() {
   let xp = character.xp;
   xp++;
    $("#xpCurrent").text(xp);
    saveXp(xp);
});

$("#xpDown").on("click", function() {
    let xp = character.xp;
    xp--;
     $("#xpCurrent").text(xp);
     saveXp(xp);
 });

 $(".increaseDie").on("click", function() {
    const skillName = $(this).prev().prev().find(".title").text();
    const index = character.skills.findIndex(object => {
        return object.name === skillName;
      });

    character.skills[index].dice++;

    const dieNum = character.skills[index].dice;

    $("#dieNum" + character.skills[index].cc).text(dieNum);
    $("#editDieNum" + character.skills[index].cc).val(dieNum);

    saveSkills();
 });