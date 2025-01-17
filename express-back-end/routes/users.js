const router = require('express').Router();

module.exports = (db) => {
  // GET: All the users in the database
  router.get('/', (req, res) => {
    db('users')
      .select()
      .then((users) => {
        if (users.length > 0) {
          return res.status(200).json({ users });
        }
        throw Error;
      })
      .catch(() => {
        res.status(500).json({
          Error: "Sorry! We couldn't find what you were looking for!",
        });
      });
  });
  // GET: A specific user, and each of their lists, lists_titles
  router.get('/:id', (req, res) => {
    db('users')
      .select(
        'email',
        'platforms',
        'bio',
        'birthdate',
        'timezone',
        'discord_username',
        'in_game_usernames',
        'avatar'
      )
      .where({ id: req.params.id })
      .then((user) => {
        db('game')
          .select(
            'users_lists.id as listID',
            'list_title',
            'games_catalog.name',
            'game.num_hours_played',
            'category',
            'background_image',
            'game.list_id',
            'games_catalog.id as gameID',
            'game.id as game_id'
          )
          .rightOuterJoin('games_catalog', 'game_id', '=', 'games_catalog.id')
          .rightOuterJoin('users_lists', 'users_lists.id', '=', 'game.list_id')
          .where('users_lists.user_id', req.params.id)
          .orderBy('list_id')
          .then((list) => {
            const collection = {};
            const lists = {};
            for (const item of list) {
              if (item.category === 'Stats' && !collection[item.list_title]) {
                collection[item.list_title] = [];
                const category = item.category;
                const id = item.listID;
                collection[item.list_title].push(category);
                collection[item.list_title].push(id);
              }
              if (item.category === 'Stats' && collection[item.list_title]) {
                collection[item.list_title].push({
                  name: item.name,
                  hours_played: item.num_hours_played,
                  background_image: item.background_image,
                  id: item.gameID,
                  game_id: item.game_id,
                });
              }
              if (item.category !== 'Stats' && !lists[item.list_title]) {
                lists[item.list_title] = [];
                const category = item.category;
                const id = item.listID;
                lists[item.list_title].push(category);
                lists[item.list_title].push(id);
              }
              if (item.category !== 'Stats' && lists[item.list_title]) {
                lists[item.list_title].push({
                  name: item.name,
                  hours_played: item.num_hours_played,
                  background_image: item.background_image,
                  id: item.gameID,
                  game_id: item.game_id,
                });
              }
            }

            return res.status(200).json({ user, collection, lists });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          Error: "Sorry! We couldn't find what you were looking for!",
        });
      });
  });
  // GET: A list of stats about the user
  router.get('/stats/:id', (req, res) => {
    res.status(200).json({ hello: 'works' });
  });

  return router;
};
