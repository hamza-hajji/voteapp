$(document).ready(function () {
  
  var currNum = $('.options input').length;
  console.log(currNum);
  $('#addButton').click(function (e) {
    e.preventDefault();
    currNum++;
    $('.options').append(
      `
      <input type="text" name="options[${currNum}][name]"
        class="form-control" id="option${currNum}"
        placeholder="Option ${currNum}"><br>
      `
    );
  });

  $('#removeButton').click(function (e) {
    e.preventDefault();
    if (currNum === 2) return;
    $(`#option${currNum} + br`).remove();
    $(`#option${currNum}`).remove();
    currNum--;
  });
});