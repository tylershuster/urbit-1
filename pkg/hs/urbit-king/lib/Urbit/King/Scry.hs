{-|
  Scry helpers
-}

module Urbit.King.Scry (scryNow) where

import Urbit.Prelude
import Urbit.Vere.Serf.Types

import qualified Urbit.Noun.Time as Time

scryNow :: forall e n
        . (HasLogFunc e, FromNoun n)
       => (Time.Wen -> Gang -> Path -> IO (Maybe (Term, Noun)))
       -> Text
       -> Ship
       -> Text
       -> [Text]
       -> RIO e (Maybe n)
scryNow scry vare ship desk path = do
  env <- ask
  wen <- io Time.now
  let wan = tshow $ Time.MkDate wen
  let pax = Path $ fmap MkKnot $ vare : (tshow ship) : desk : wan : path
  io (scry wen Nothing pax) >>= \case
    Just (_, fromNoun @n -> Just v) -> pure $ Just v
    Just (_, n) -> do
      logError $ displayShow (vare, "uncanny scry result", pax, n)
      pure Nothing
    Nothing -> pure Nothing

