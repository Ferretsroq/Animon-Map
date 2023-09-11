class Animon
{
    constructor(name, level, biome)
    {
        this.name = name;
        this.level = level;
        this.biome = biome;
    }
    toString()
    {
        return `${this.name}: Level ${this.level}`
    }
}

const Lancelotl = new Animon('Lancelotl', 3, 'OCEAN')

export default {Animon, Lancelotl};