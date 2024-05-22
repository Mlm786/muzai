import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const Faq = () => {
  return (
    <div id="faq" className="mb-32">
      <h2 className="text-4xl text-center mb-10 font-extrabold text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full p-5 lg:max-w-[511px]"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Lorem ipsum dolor sit amet?</AccordionTrigger>
          <AccordionContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            quasi!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Lorem ipsum dolor sit amet?</AccordionTrigger>
          <AccordionContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            quasi!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Lorem ipsum dolor sit amet?</AccordionTrigger>
          <AccordionContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            quasi!
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Lorem ipsum dolor sit amet?</AccordionTrigger>
          <AccordionContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos,
            quasi!
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Faq;
