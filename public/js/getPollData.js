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
                  'rgba(255, 0, 132, 0.2)'
              ]
            }]
          }
        };
        var myChart = new Chart(ctx, chartObj);
      }
    }
  });

});