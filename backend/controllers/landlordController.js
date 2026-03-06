const supabase = require('../config/supabase');
const { normalizeLandlord } = require('../utils/normalize');

exports.getAllLandlords = async (req, res) => {
  try {
    const { data: landlords, error } = await supabase
      .from('landlords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch landlords.' });
    res.json(landlords.map(normalizeLandlord));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createLandlord = async (req, res) => {
  try {
    const { data: landlord, error } = await supabase
      .from('landlords')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(500).json({ message: 'Failed to create landlord.' });
    res.status(201).json(normalizeLandlord(landlord));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.verifyLandlord = async (req, res) => {
  try {
    const { data: landlord, error } = await supabase
      .from('landlords')
      .update({ verified: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !landlord) return res.status(404).json({ message: 'Landlord not found.' });
    res.json(normalizeLandlord(landlord));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteLandlord = async (req, res) => {
  try {
    const { error } = await supabase.from('landlords').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: 'Failed to delete landlord.' });
    res.json({ message: 'Landlord deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
