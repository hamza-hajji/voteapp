$(document).ready(function() {

  var urlParams = window.location.pathname.split('/');
  var pollName    = urlParams[2];

  function allZeros(options) {
    for (var option of options) {
      if (option.votes !== 0) return false;
    }
    return true;
  }

  $.ajax({
    url: `${window.location.origin}/api/polls/${pollName}`,
    method: 'GET',
    success: function(data) {
      var $optionElement = '';

      $('.poll-title').html(data.poll.name);
      $('.poll-author').html(data.poll.user);
      if (allZeros(data.poll.options)) {
        $('.output').html($('<p class="lead">')
          .html('There is nothing to show, be the first one to vote!'));
        $('#myChart').remove();
      } else {
        var ctx = document.getElementById("myChart").getContext('2d');
        var chartObj = {
          type: 'doughnut',
          data: {
            labels: data.poll.options.map(function(option) { return option.name }),
            datasets: [{
              label: 'Votes',
              data: data.poll.options.map(function(option) { return option.votes }),
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ]
            }]
          }
        };
        var myChart = new Chart(ctx, chartObj);
      }

      for (let option of data.poll.options) {
        console.log(option.name);
        $optionElement += `
        <div class="form-check">
          <label class="form-check-label">
            <input value="${option.name}" class="form-check-input" type="radio" name="vote">
            ${option.name}
          </label>
        </div>`;
      }
      $('#votingModal .modal-body form').html($optionElement);
    }
  });

  var name = '';
  $(document.body).on('click', 'input[name="vote"]', function (e) {
    var radios = $('input[name="vote"]');
    for (var radio of radios) {
      if ($(radio).prop('checked')) name = $(radio).val();
    }
  });

  $(document.body).on('click', '#voteButton', function (e) {
    e.preventDefault();
    if (window.localStorage.getItem(pollName)) {
      window.location = `${window.location.origin}/polls/${pollName}`;
      alert('You already voted in this poll!');
    } else {
      $.ajax({
        url: `${window.location.origin}/api/polls/${pollName}/vote/${name}`,
        method: 'POST',
        success: function () { // redirect to poll page
          window.localStorage.setItem(pollName, name);
          window.location = `${window.location.origin}/polls/${pollName}`;
        }
      });
    }

  });
});