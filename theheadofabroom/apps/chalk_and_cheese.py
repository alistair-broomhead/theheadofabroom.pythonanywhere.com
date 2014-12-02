"""
Chalk and Cheese is an online multiplayer game inspired by Skull

Players are mice who each have a stash of cheese and a piece of chalk. Players
take it in turns to place in their pile either a chalk or a cheese - from the
last player on the second placement round, a mouse can choose to start bidding
for how much cheese they think they can collect in a raid. Players can then
choose to bid more if they think they can collect more.

The winning bidder then chooses one pile at a time to draw from, until they have
made their quota, making the raid successful. If they bite into a chalk, the
raid is unsuccessful, and they must forfeit a token from their stash at random.

The first mouse to make two successful raids is crowned the winner.

------

This is the  back-end for the game, and is a rest service.

    /table          POST    Vote to start a new game. (there must not be one in
                            progress)
    /table          GET     Get what's visible on the table.

    /user           GET     Get a list of connected users.
    /user           PUT     Change user data such as name or password.
                            (must have a session to edit)
    /user           POST    Join the session, send the auth data used for other
                            requests. (must not have a current session)

    /user/hand      GET     Get the cards currently in your hand. (Game must be
                            in progress)

    /token          POST    Place either a chalk or a cheese.(must be your turn)
    /token/{pile}   GET     Draw a token from the top of the given pile. (must
                            be raiding)

    /bid            GET     The status of current bids on the table.
    /bid            POST    Place a bid (must be your turn)
"""

