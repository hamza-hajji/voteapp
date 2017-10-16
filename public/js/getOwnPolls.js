$(document).ready(function () {
  $.ajax({
    url: `${window.location.origin}/api/mypolls`,
    method: 'GET',
    success: function (data) {
      for (var poll of data.polls) {
        var pollLink = '/polls/' + poll.name;
        var $pollElement = `
        <li class="list-group-item list-group-item-action flex-column align-items-start">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1"><a class="text-dark" href="${pollLink}" target="_blank">${poll.name}</a></h5><br><br>
            <button data-value="${poll.name}" id="deletePoll" class="btn btn-dark">Delete</button>
          </div>
        </li>
        `;
        $('.list-group').append($pollElement);
      }
    }
  });

  $(document.body).on('click', '#deletePoll', function (e) {
    console.log('button');
    var pollName = $(e.target).data('value');
    $.ajax({
      url: `${window.location.origin}/api/polls/${pollName}`,
      method: 'DELETE',
      success: function () {
        console.log('ajax');
        window.location = `${window.location.origin}/myPolls`; // redirect to my polls page
      }
    });
  });
});