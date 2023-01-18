$(".deleteSkill").on("click", function () {
    $(this).parent().remove();
});

$("#addSkillBuilder").on("click", function() {
    $(this).before('<div class="inputSkillAndDice"><input class="r4sInput" type="text" name="skillName[]" placeholder="Skill Name" required><div class="formDieContainer"><input class="r4sInput" type="number" value="2" name="skillDice[]" required><h2 class="subTitle">d6</h2></div><button class="deleteBtn"><span class="material-symbols-outlined">delete</span></button></div>');
});