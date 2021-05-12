import 'dotenv/config';
import * as fs from 'fs';
import Database from '../structures/Database';
import { dbName } from '../Config';
import CardsModel from '../models/CardsModel';

interface Black {
  text: string;
  pick: number;
}

interface Cards {
  white: string[];
  black: Black[];
}

interface CardsModelObject {
  text: string;
  white: boolean;
}

(async () => {
  const db = Database.get(dbName);
  await db.connect();
  await db.synchronize();

  console.log('Clearing cards table');
  const cardsRepo = await db.getRepository(CardsModel);
  await cardsRepo.clear();

  console.log('Reading JSON');
  // eslint-disable-next-line consistent-return
  await fs.readFile('./src/migration/cah-cards-compact.json', 'utf8', async (err, jsonString) => {
    if (err) return console.log('File read failed:', err);

    console.log('Parsing JSON');
    const cards: Cards = JSON.parse(jsonString);

    const cardsToSave: CardsModelObject[] = [];

    console.log('Adding white cards');
    cards.white.forEach((whiteCard) => {
      cardsToSave.push({
        text: whiteCard,
        white: true,
      } as CardsModelObject);
    });

    console.log('Adding black cards');
    cards.black.forEach((whiteCard) => {
      cardsToSave.push({
        text: whiteCard.text,
        white: false,
      } as CardsModelObject);
    });

    console.log('Saving...');
    await cardsRepo.createQueryBuilder()
      .insert()
      .into(CardsModel)
      .values(cardsToSave)
      .execute();
    console.log('Done.');
  });
})().catch((err) => console.log(err.stack));
