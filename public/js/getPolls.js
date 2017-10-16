$(document).ready(function () {
  $.ajax({
    url: `${window.location.origin}/api/polls`,
    method: 'GET',
    success: function (data) {

      if (data.polls.length === 0) {
        $('#output').html(`
          <p class="lead">There are currently no polls! wanna create one?</p>
          <a href="/new" class="btn btn-dark">New Poll</a>
        `);
      } else {
        for (var poll of data.polls) {
          var pollLink = '/polls/' + poll.name;
          var $pollElement = `
          <a href="${pollLink}" target="_blank" class="list-group-item list-group-item-action flex-column align-items-start">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">${poll.name}</h5>
              <small>${poll.options.length}</small>
            </div>
            <p class="mb-1">created by ${poll.user}</p>
          </a>`;
          $('.list-group').append($pollElement);
        }
      }
    }
  });
});