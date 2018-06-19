var { _, d3, fs, glob, io, queue, request } = require('scrape-stl')


var matches = glob.sync(__dirname + '/raw/matchtimeline/*').forEach((path, i) => {
  if (i) return

  var game = path.split('matchtimeline/')[1].replace('.json', '')
  
  var outFrames = []
  var outEvents = []
  io.readDataSync(path).frames.forEach(d => {
    var timestamp = d.timestamp

    d3.values(d.participantFrames).forEach(d => {
      d.game = game
      d.timestamp = timestamp

      var {x, y} = d.position
      d.x = x
      d.y = y
      delete d.position

      outFrames.push(d)
    })

    console.log(d.events)

    d.events.forEach(d => {
      d.game = game

      if (d.position){
        var {x, y} = d.position
        d.x = x
        d.y = y
        delete d.position
      }

      if (d.assistingParticipantIds) d.assistingParticipantIds = d.assistingParticipantIds.join(' ')

      outEvents.push(d)
    })

  })


  var outPath = path
    .replace('matchtimeline', 'matchtimeline-frames')
    .replace('.json', '.csv')

  io.writeDataSync(outPath, outFrames)


  var outPath = path
    .replace('matchtimeline', 'matchtimeline-events')
    .replace('.json', '.csv')

  io.writeDataSync(outPath, outEvents)

})
