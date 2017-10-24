$(document).ready(function() {

  var urlParams = window.location.pathname.split('/');
  var pollID    = urlParams[2];
  var pollLink  = `${window.location.origin}/polls/${pollID}`;

  function allZeros(options) {
    for (var option of options) {
      if (option.votes !== 0) return false;
    }
    return true;
  }

  $.ajax({
    url: `${window.location.origin}/api/polls/${pollID}`,
    method: 'GET',
    success: function(data) {
      var $optionElement = '';
      if ($.isEmptyObject(data)) {
        alert('Poll not found!');
        window.location = window.location.origin;
        return
      }

      $('.poll-link').text(pollLink);
      $('.poll-title').text(data.poll.name);
      $('.poll-author').text(data.poll.user);
      if (allZeros(data.poll.options)) {
        $('.output').html($('<p class="lead">')
          .html('There is nothing to show, be the first one to vote!'));
        $('#myChart').remove();
      } else {
        var ctx = document.getElementById("myChart").getContext('2d');
        var ict_unit = [];
        var efficiency = [];
        var colors = [];
        var dynamicColor = function() {
          var r = Math.floor(Math.random() * 255);
          var g = Math.floor(Math.random() * 255);
          var b = Math.floor(Math.random() * 255);
          return "rgba(" + r + "," + g + "," + b + ", .2)";
        };

        for (var option in data.poll.options) {
          colors.push(dynamicColor());
        }
        var chartObj = {
          type: 'doughnut',
          data: {
            labels: data.poll.options.map(function(option) { return option.name }),
            datasets: [{
              label: 'Votes',
              data: data.poll.options.map(function(option) { return option.votes }),
              backgroundColor: colors
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
    },
    error: function() {
      alert('Poll not found!');
      window.location = window.location.origin;
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
    if (window.localStorage.getItem(pollID)) {
      window.location = pollLink;
      alert('You already voted in this poll!');
    } else {
      $.ajax({
        url: `${window.location.origin}/api/polls/${pollID}/vote/${name}`,
        method: 'POST',
        success: function () { // redirect to poll page
          window.localStorage.setItem(pollID, name);
          window.location = pollLink;
        }
      });
    }

  });
});
