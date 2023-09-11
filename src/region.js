function RegionDetails(biome)
{
    if(biome == 'WATER')
    {
        const options = ['Lancelotl Colony', 'Coral Reef', 'Sea Monster'];
        const selection = options[Math.floor(Math.random()*options.length)];
        return selection;
    }
    else
    {
        return 'No data';
    }
}

export default RegionDetails;