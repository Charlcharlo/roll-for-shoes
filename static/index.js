
$(".deleteSkill").on("click", function () {
    $(this).closest(".inputSkillAndDice").remove();
});

$(".deleteItem").on("click", function () {
    $(this).closest(".itemBlock").remove();
});

$("#addSkillBuilder").on("click", function() {
    $(this).before('<div class="inputSkillAndDice"><input class="r4sInput" type="text" name="skillName[]" placeholder="Skill Name" required><div class="formDieContainer"><input class="r4sInput" type="number" value="2" name="skillDice[]" required><h2 class="subTitle">d6</h2></div><button class="deleteBtn deleteSkill"><span class="material-symbols-outlined">delete</span></button></div>');
    $(".deleteSkill").on("click", function () {
        $(this).closest(".inputSkillAndDice").remove();
    });
});

$(".addItemBuilder").on("click", function() {
    $(this).before('<div class="itemBlock"><div class="inputSkillAndDice"><input class="r4sInput" type="text" name="itemName[]" placeholder="Item Name" required><div class="formDieContainer"><h2 class="subTitle">x</h2><input class="r4sInput" type="number" value="1" name="itemQty[]" required><button class="deleteBtn deleteItem"><span class="material-symbols-outlined">delete</span></button></div></div><div class="inputSkillAndDice"><input class="r4sInput" type="text" name="itemDesc[]" placeholder="Description" maxlength="120"></div></div>')
    $(".deleteItem").on("click", function () {
        $(this).closest(".itemBlock").remove();
    });
});