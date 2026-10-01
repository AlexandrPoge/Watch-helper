export function isActor(person: { enProfession?: string; profession?: string }) {
  return /^(actor|actress)$/i.test(person.enProfession ?? '') || /акт[её]р|актрис/i.test(person.profession ?? '')
}
