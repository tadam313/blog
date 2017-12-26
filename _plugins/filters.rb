module Filters
  module TernaryFilter
    def if(true_output, value, fallback = nil)
      value ? true_output : fallback
    end

    def unless(false_output, value, fallback = nil)
      value ? false_output : fallback
    end
  end
end

Liquid::Template.register_filter(Filters::TernaryFilter)
